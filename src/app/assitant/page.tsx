"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Image from "next/image"; // Import Image correctly

const CatCharacter = () => {
  return (
    <motion.div
      className="absolute bottom-0 w-full flex justify-center"
      initial={{ y: "100vh" }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 50 }}
    >
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="40" fill="#ffa500" />
        <circle cx="35" cy="40" r="5" fill="#000" />
        <circle cx="65" cy="40" r="5" fill="#000" />
        <motion.path
          d="M 30 60 Q 50 80 70 60"
          stroke="#000"
          strokeWidth="2"
          fill="transparent"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.circle
          cx="80"
          cy="70"
          r="10"
          fill="#ffa500"
          animate={{ rotate: [0, 15, -15, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </svg>
    </motion.div>
  );
};

const Assistant = () => {
  const [name, setName] = useState("");
  const [greeted, setGreeted] = useState(false);
  const [budget, setBudget] = useState("");
  const [officeSetup, setOfficeSetup] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [items, setItems] = useState([]);
  const [itemDetails, setItemDetails] = useState([]);
  console.log(itemDetails);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim() !== "") {
      setGreeted(true);
    }
  };

  const handleOfficeSetupSubmit = async (e) => {
    e.preventDefault();
    const userPreferences = {
      name: name,
      officeSetup: officeSetup,
      budget: budget,
    };

    const userQuestion = `I am looking to buy ${officeSetup} under ${budget}. What items should I consider? you should only give the name of essentials items required for ${officeSetup} only and respond with putting the items in an array only not plain text
    . Only give 5 essential items that are most important and can come under
     ${budget}`;
    setQuestion(userQuestion);

    setGeneratingAnswer(true);
    setAnswer("Loading your answer... \n It might take up to 10 seconds");

    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEN_AI_KEY}`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: userQuestion }] }],
        },
      });

      const text = response.data.candidates[0].content.parts[0].text;
      console.log("Raw Response Text:", text); // Debugging line

      const extractedItems = text
        .split("\n")
        .filter((item) => item.trim().startsWith("-"))
        .map((item) => item.replace("-", "").trim());

      console.log("Extracted Items:", extractedItems); // Debugging line

      setItems(extractedItems);

      // Fetch item details for each extracted item
      const itemDetailsPromises = extractedItems.map(async (item) => {
        const response = await axios.post("/api/scrap-walmart", {
          title: item,
        });
        return response.data;
      });

      const details = await Promise.all(itemDetailsPromises);
      setItemDetails(details);

      setAnswer("");
    } catch (error) {
      console.error(error);
      setAnswer("Sorry - Something went wrong. Please try again!");
    } finally {
      setGeneratingAnswer(false);
    }
  };

  // Calculate total price
  const totalPrice = itemDetails.reduce((total, item) => {
    const price = parseFloat(item.pricing?.offer_price || 0);
    return total + price;
  }, 0);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 relative">
      <motion.div
        className="p-6 bg-white shadow-lg rounded-lg text-center"
        initial={{ y: "100vh" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 50, delay: 1 }}
      >
        {!greeted ? (
          <>
            <p className="mb-4 text-xl">
              Hi! My name is Mia, how are you? What’s your name, sir/mam?
            </p>
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                className="border rounded-md p-2 w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
              <button
                type="submit"
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Submit
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mb-4 text-xl">
              Hi {name}! Nice to meet you. What are you looking to buy today?
              You can ask me about furniture for your new home.
            </p>
            <form onSubmit={handleOfficeSetupSubmit}>
              <input
                type="text"
                className="border rounded-md p-2 w-full mb-4"
                value={officeSetup}
                onChange={(e) => setOfficeSetup(e.target.value)}
                placeholder="Describe your office setup"
              />
              <input
                type="text"
                className="border rounded-md p-2 w-full mb-4"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Enter your budget"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Submit
              </button>
            </form>
          </>
        )}
      </motion.div>
      <CatCharacter />
      {generatingAnswer && <p>{answer}</p>}
      {itemDetails.length > 0 && (
        <div className="mt-6 p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl mb-4">Suggested Office Setup Items</h2>
          {itemDetails.map((item, index) => (
            <div
              key={index}
              className="mb-4"
              onClick={() => (window.location.href = `${item.link}`)}
            >
              <h3 className="text-xl">{item.title}</h3>
              <p>{item.desc}</p>
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  3
                  width={200}
                  height={200}
                />
              )}
              <p>Pricing: ${item.pricing?.offer_price || "N/A"}</p>
              <p>Rating: {item.rating || "N/A"}</p>
            </div>
          ))}
          <div className="mt-4 text-xl font-bold">
            <p>Total Price: ${totalPrice.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assistant;
