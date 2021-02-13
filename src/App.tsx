import React, { useEffect, useState } from 'react';
import './App.css';

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
const ffmpeg = createFFmpeg({ log: true });

const App: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState<any>();
  const [gif, setGif] = useState<string>();

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) =>
    e.target.files?.item(0) && setVideo(e.target.files?.item(0));

  const convertToGif = async () => {
    await ffmpeg.FS('writeFile', 'test.mp4', await fetchFile(video));
    await ffmpeg.run(
      '-i',
      'test.mp4',
      '-t',
      '2.5',
      '-ss',
      '2.0',
      '-f',
      'gif',
      'out.gif'
    );
    const data = ffmpeg.FS('readFile', 'out.gif');
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: 'image/gif' })
    );
    setGif(url);
  };

  useEffect(() => {
    load();
  }, []);

  return ready ? (
    <div className="App">
      {video && (
        <video controls width="250" src={URL.createObjectURL(video)}></video>
      )}

      <input
        type="file"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleVideoUpload(e)
        }
      />

      <h3>Result</h3>
      <button onClick={convertToGif}>Convert</button>

      {gif && <img src={gif} width="250px" />}
    </div>
  ) : (
    <p>loading..</p>
  );
};

export default App;
