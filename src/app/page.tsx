"use client";
import Image from "next/image";
import React, { useState } from "react";

const Home = () => {
  console.log(process.env.NEXT_PUBLIC_SERP_API_KEY);

  const [title, setUrl] = useState(""); // State to store user input URL
  const [link, setLink] = useState({
    title: null,
    desc: null,
    image: null,
    pricing: null,
    rating: null,
  });

  const handleInputChange = (e: any) => {
    setUrl(e.target.value);
  };

  const fetchLink = async () => {
    try {
      const response = await fetch("/api/scrap-walmart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();
      setLink({
        title: data.title,
        desc: data.desc,
        image: data.thumbnail,
        pricing: data.primary_offer,
        rating: data.rating,
      });
      console.log(link);
    } catch (error) {
      console.error("Error fetching link:", error);
    }
  };

  return (
    <div>
      <h1>Home</h1>
      <input
        style={{
          color: "black",
        }}
        type="text"
        placeholder="Enter URL"
        value={title}
        onChange={handleInputChange}
      />
      <button onClick={fetchLink}>Fetch Link</button>
      {/* Display the fetched data */}
      {link.image && link.title && (
        <div>
          <h2>{link.title}</h2>
          <p>{link.desc}</p>
          <Image src={link.image} alt={link.title} />
          <p>Pricing: {link.pricing}</p>
          <p>Rating: {link.rating}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
