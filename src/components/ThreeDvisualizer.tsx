"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../app/assets/3DModelVisualizer.css';
const ThreeDModelVisualizer = () => {
  const [mode, setMode] = useState('preview');
  const [prompt, setPrompt] = useState('Your pretty Imagination');
  const [artStyle, setArtStyle] = useState('realistic');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [taskId, setTaskId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [glbUrl, setGlbUrl] = useState('');

  const apiKey = process.env.NEXT_PUBLIC_MESHY_KEY;
  console.log(apiKey);

  const convertTextTo3D = async () => {
    try {
      const response = await axios.post(
        'https://api.meshy.ai/v2/text-to-3d',
        {
          mode,
          prompt,
          art_style: artStyle,
          negative_prompt: negativePrompt,
        },
        {
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      );
      if (response.status === 200 || response.status === 202) {
        setTaskId(response.data.result);
      } else {
        console.error('Failed to convert text to 3D:', response);
      }
    } catch (error) {
      console.error('Error converting text to 3D:', error);
    }
  };

  useEffect(() => {
    let interval:any;
    if (taskId) {
      const fetchTaskStatus = async () => {
        try {
          const response = await axios.get(`https://api.meshy.ai/v2/text-to-3d/${taskId}`, {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          const result = response.data;
          setStatus(result.status);
          setProgress(result.progress);
          if (result.status === 'SUCCEEDED' && result.progress === 100) {
            setGlbUrl(result.model_urls.glb);
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Error fetching task status:', error);
          clearInterval(interval);
        }
      };
      interval = setInterval(fetchTaskStatus, 5000);
    }
    return () => clearInterval(interval);
  }, [taskId, apiKey]);

  return (
    <div className="container bg-pink-50">
      <h1 className='text-4xl font-bold'>3D Model Visualizer</h1>
      <div className="form-group">
        <label>Mode:</label>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="preview">Preview</option>
          <option value="refine">Refine</option>
        </select>
      </div>
      <div className="form-group">
        <label>Prompt:</label>
        <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Art Style:</label>
        <select value={artStyle} onChange={(e) => setArtStyle(e.target.value)}>
          <option value="realistic">Realistic</option>
          <option value="cartoonish">Cartoonish</option>
          <option value="abstract">Abstract</option>
        </select>
      </div>
      <div className="form-group">
        <label>Negative Prompt:</label>
        <input type="text" value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} />
      </div>
      <button className='bg-pink-400 rounded' onClick={convertTextTo3D}>Convert Text to 3D</button>

      {taskId && (
        <div>
          {status === 'SUCCEEDED' && progress === 100 ? (
            <a className="text-blue" href={glbUrl} download>
              <h1>Download GLB file</h1>
            </a>
          ) : (
            <div>
              <p>Conversion in progress. Please wait...</p>
              <p>Progress: {progress}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThreeDModelVisualizer;
