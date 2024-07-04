'use client';

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Frame } from "@gptscript-ai/gptscript";
import renderEventMessage from "@/lib/renderEventMessage";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const storiesPath = "public/stories";

function StoryWriter() {
    const [story, setStory] = useState("");
    const [pages, setPages] = useState<number | null>(null);
    const [progress, setProgress] = useState("");
    const [runStarted, setRunStarted] = useState<boolean>(false);
    const [runFinished, setRunFinished] = useState<boolean | null>(null);
    const [currentTool, setCurrentTool] = useState("");
    const [events, setEvents] = useState<Frame[]>([]);
    const router = useRouter();

    async function runScript() {
        setRunStarted(true);
        setRunFinished(false);

        const response = await fetch('/api/run-script', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ story, pages, path: storiesPath }),
        });

        if (response.ok && response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            handleStream(reader, decoder);
        } else {
            setRunFinished(true);
            setRunStarted(false);
            console.error("Failed to start stream");
        }
    }

    async function handleStream(reader: ReadableStreamDefaultReader<Uint8Array>, decoder: TextDecoder) {
        // Manage the stream
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const eventData = chunk
                .split("\n\n")
                .filter((line) => line.startsWith("event:"))
                .map((line) => line.replace(/^event: /, ""));
            eventData.forEach(data => {
                try {
                    const parsedData = JSON.parse(data);
                    if (parsedData.type === "callProgress") {
                        setProgress(parsedData.output[parsedData.output.length - 1].content);
                        setCurrentTool(parsedData.tool?.description || "");
                    } else if (parsedData.type === "callstart") {
                        setCurrentTool(parsedData.tool?.description || "");
                    } else if (parsedData.type === "runFinish") {
                        setRunFinished(true);
                        setRunStarted(false);
                    } else {
                        setEvents((prevEvents) => [...prevEvents, parsedData]);
                    }
                } catch (error) {
                    console.error("Failed to parse JSON", error);
                }
            });
        }
    }

    useEffect(() => {
        if (runFinished) {
            toast.success("Cerita sukses digenerate", {
                action: (
                    <Button
                        onClick={() => router.push("/stories")}
                        className="bg-blue-500 ml-auto">
                        Baca cerita
                    </Button>
                )
            });
        }
    }, [runFinished, router]);

    return (
        <div className="flex flex-col container">
            <section className="flex-1 flex flex-col border border-blue-500 rounded-md p-10 space-y-2">
                <Textarea
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    className="flex-1 text-black"
                    placeholder="Contoh ide: Buat cerita tentang anak bernama Kiddo yang bertualang di dunia robot ..."
                />
                <Select onValueChange={(value: string) => setPages(parseInt(value))}>
                    <SelectTrigger>
                        <SelectValue placeholder="Kamu mau idemu jadi berapa halaman cerita?" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                        {Array.from({ length: 10 }, (_, i) => (
                            <SelectItem key={i} value={String(i + 1)}>
                                {i + 1}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    disabled={!story || !pages || runStarted}
                    className="w-full"
                    size="lg"
                    onClick={runScript}>
                    Buat Cerita
                </Button>
            </section>
            <section className="flex-1 pb-5 mt-5">
                <div className="flex flex-col-reverse w-full space-y-2 bg-blue-800 rounded-md text-gray-200 font-mono p-10 h-96 overflow-y-auto">
                    <div>
                        {runFinished === null && (
                            <>
                                <p className="animate-pulse mr-5">Menunggu kamu mengetik ide untuk membuat cerita...</p>
                                <br />
                            </>
                        )}
                        <span className="mr-5">{">>"}</span>
                        {progress}
                    </div>
                    {currentTool && (
                        <div className="py-10">
                            <span className="mr-5">{"--- [Current Tool] ---"}</span>
                            {currentTool}
                        </div>
                    )}
                    <div className="space-y-5">
                        {events.map((event, index) => (
                            <div key={index}>
                                <span className="mr-5"></span>
                                {renderEventMessage(event)}
                            </div>
                        ))}
                    </div>
                    {runStarted && (
                        <>
                            <span className="mr-5 animate-in">
                                {"--- [Cerita AI dimulai] ---"}
                            </span>
                            <br />
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}

export default StoryWriter;
