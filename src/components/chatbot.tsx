import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Link,
  CircularProgress,
} from "@mui/material";
import TypewriterComponent from "typewriter-effect";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);

  async function generateAnswer(e:any) {
    setGeneratingAnswer(true);
    e.preventDefault();
    setAnswer("Loading your answer... \n It might take up to 10 seconds");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${
          process.env.REACT_APP_GEN_AI_KEY
        }`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: question }] }],
        },
      });

      setAnswer(response.data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.log(error);
      setAnswer("Sorry - Something went wrong. Please try again!");
    }

    setGeneratingAnswer(false);
  }

  return (
        <Box
          sx={{
            background: "linear-gradient(to right, #2e2e2e, #1c1c1c)", // grey-black gradient
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 3,
          }}
        >
          <Container maxWidth="sm">
            <Paper
              elevation={6}
              sx={{
                padding: 4,
                textAlign: "center",
                transition: "transform 0.5s",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              <Typography
                variant="h4"
                component="div"
                sx={{
                  background: "linear-gradient(to right, #9c27b0, #f06292)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: "bold",
                }}
              >
                <TypewriterComponent
                  options={{
                    strings: ["Chatbot", "AI Assistant", "Recommender"],
                    autoStart: true,
                    loop: true,
                  }}
                />
              </Typography>
              <form onSubmit={generateAnswer}>
                <TextField
                  required
                  fullWidth
                  multiline
                  minRows={4}
                  variant="outlined"
                  margin="normal"
                  label="Ask anything"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginTop: 2, color: generatingAnswer ? "inherit" : "#fff" }}
                  disabled={generatingAnswer}
                >
                  {generatingAnswer ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Generate answer"
                  )}
                </Button>
              </form>
            </Paper>
            <Paper
              elevation={6}
              sx={{
                padding: 4,
                textAlign: "center",
                marginTop: 4,
                transition: "transform 0.5s",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              <ReactMarkdown>{answer}</ReactMarkdown>
            </Paper>
          </Container>
        </Box>
      );
}

export default App;
