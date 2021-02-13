import React, { useEffect, useState } from 'react';
import './App.css';

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { Button, CardMedia } from '@material-ui/core';
const ffmpeg = createFFmpeg({ log: true });

const getFileType = (file: File) => {
  if (file) {
  }
};

const App: React.FC = () => {
  const [ready, setReady] = useState<boolean>(false);
  const [video, setVideo] = useState<File | null>();
  const [gif, setGif] = useState<string>();

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.files?.item(0) && setVideo(e.target.files.item(0));
    console.log(e.target.files?.item(0));
  };

  const convertToGif = async () => {
    if (video) {
      const type = video.type.split('/')[1];
      const rootName = `${video.name.split(`.${type}`)}`;

      await ffmpeg.FS('writeFile', `${video.name}`, await fetchFile(video));
      await ffmpeg.run(
        '-i',
        `${video.name}`,
        '-t',
        '2.5',
        '-ss',
        '2.0',
        '-f',
        'gif',
        `${rootName}.gif`
      );

      const data = ffmpeg.FS('readFile', `${rootName}.gif`);
      const url = URL.createObjectURL(
        new Blob([data.buffer], { type: 'image/gif' })
      );
      setGif(url);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return ready ? (
    <div className="app">
      <h1 className="heading">Welcome to GIF it!</h1>
      <h4 className="sub-heading">
        Please upload an mp4 to convert it to a GIF!
      </h4>
      {video && (
        <video
          className="video-preview"
          controls
          src={URL.createObjectURL(video)}
        ></video>
      )}
      <form className="conversion-form">
        <Button variant="contained" component="label">
          Upload File
          <input
            type="file"
            hidden
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleVideoUpload(e)
            }
          />
        </Button>

        <h3></h3>

        {video && (
          <Button variant="contained" onClick={convertToGif} color="primary">
            Convert
          </Button>
        )}

        {gif && <img src={gif} width="250px" />}
      </form>
    </div>
  ) : (
    <p>loading..</p>
  );
};

export default App;
