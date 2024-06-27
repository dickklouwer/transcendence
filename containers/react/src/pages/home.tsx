"use client";


import { FunctionRouter } from "@/app/page";

export default function Home({ navigateToMenu }: { navigateToMenu: FunctionRouter }) {
  
    return (
      <div className="flex justify-center items-center flex-grow">
        <h2
          className="text-4xl font-bold text-center cursor-pointer"
          onClick={navigateToMenu}
        >
          PONG!
        </h2>
      </div>
    );
  }