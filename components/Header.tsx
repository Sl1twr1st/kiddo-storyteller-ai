import { BookOpen, FilePen } from "lucide-react";
import Link from "next/link";

function Header() {
  return (
  <header className="relative p-16 text-center">
    <Link href='/'>
        <h1 className="text-6xl font-black">Cerita Kiddo</h1>
        <h1 className="text-2xl font-black">Powered by AI</h1>
        <div className="flex justify-center whitespace-nowrap space-x-5 text-3xl lg:text-5xl">
            <h2></h2>
            <div className="relative">
                <div className="absolute bg-blue-500 -left-2 -top-1 -bottom-1 -right-3 -rotate-1" />

                    <p className="relative text-white">Wujudkan idemu jadi cerita seru!</p>
            </div>
        </div>
    </Link>

{/* Nav Icon */}
    <div className="absolute -top-5 right-5 flex space-x-2">
      <Link href='/'>
        <FilePen
        className="w-8 h-8 lg:w-10 lg:h-10 mx-auto test-blue-500 mt-10 border border-blue-500 p-2 rounded-md hover:opacity-50 cursor-pointer"
        />

      </Link>

      <Link href='/stories'>
        <BookOpen className="w-8 h-8 lg:w-10 lg:h-10 mx-auto test-blue-500 mt-10 border border-blue-500 p-2 rounded-md hover:opacity-50 cursor-pointer" />
        </Link>
    </div>
  </header>
  );                                                                                                                                     
  }

export default Header;