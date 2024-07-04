import { getAllStories, getStory } from "@/lib/Stories";
import { notFound } from "next/navigation";
import Story from "@/components/story";

interface StoryPageProps {
    params: {
        id: string;
    };
}

function StoryPage({params: { id }}: StoryPageProps) {
    // the id is URL encoded so we need to decode it before using it to get the story
    const decodedId = decodeURIComponent(id);

    const story = getStory(decodedId);

    if (!story) {
        return notFound();
    }

    return <Story story={story} />

  return (
    <div>Story: {decodedId}</div>
  )
}

export default StoryPage;

export async function generateStaticParams() {
    const stories = getAllStories();

    const paths = stories.map((story) => ({
        id: story.story,
    }));

    return paths;

}
