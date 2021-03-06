import React, { useEffect, useState } from 'react';
import './App.css';

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { AppBar, Button, Toolbar, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Particles from 'react-particles-js';
const ffmpeg = createFFmpeg();

const getFileType = (fileType: string): string => fileType.split('/')[1];

const App: React.FC = () => {
  const [ready, setReady] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [video, setVideo] = useState<File | null>();
  const [gif, setGif] = useState<string>();

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.target.files?.item(0) && validateFile(e.target.files.item(0));
  };

  const validateFile = (file: File | null) => {
    if (file) {
      if (
        getFileType(file.type) === 'mp4' ||
        getFileType(file.type) === 'ogg' ||
        getFileType(file.type) === 'WebM'
      ) {
        if (showError) {
          setShowError(false);
        }
        setVideo(file);
      } else {
        if (!showError) {
          setShowError(true);
        }
        if (video) {
          setVideo(null);
        }
      }
    }
  };

  const convertToGif = async (): Promise<void> => {
    if (video) {
      const type = getFileType(video.type);
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

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5">
            <b>GIF</b>Builder.me
          </Typography>
        </Toolbar>
      </AppBar>
      <div className="app">
        <Particles
          className="particle"
          height="100%"
          params={{
            particles: {
              number: {
                value: 30,
                density: {
                  enable: false,
                },
              },
              size: {
                value: 3,
                random: true,
                anim: {
                  speed: 4,
                  size_min: 0.3,
                },
              },
              line_linked: {
                enable: false,
              },
              move: {
                random: true,
                speed: 1,
                direction: 'top',
                out_mode: 'out',
              },
            },
            interactivity: {
              events: {
                onhover: {
                  enable: true,
                  mode: 'bubble',
                },
                onclick: {
                  enable: true,
                  mode: 'repulse',
                },
              },
              modes: {
                bubble: {
                  distance: 250,
                  duration: 2,
                  size: 0,
                  opacity: 0,
                },
                repulse: {
                  distance: 400,
                  duration: 4,
                },
              },
            },
          }}
          style={{
            position: 'fixed',
            right: 0,
            bottom: 0,
            left: 0,
            top: 0,
            zIndex: -100,
            height: '100vh',
            margin: 0,
            padding: 0,
            width: '100%',
            backgroundColor: '#212121',
          }}
        ></Particles>
        {ready ? (
          <Card className="content">
            <CardContent>
              {ready && (
                <>
                  {' '}
                  {showError && (
                    <Alert severity="error" className="error-message">
                      Upload failed 🤦. Please upload a valid{' '}
                      <strong>mp4</strong>, <strong>ogg</strong> or
                      <strong> WebM</strong> file.
                    </Alert>
                  )}
                  <h1 className="heading">🔨 Lets build a GIF 🔨</h1>
                  {!gif && (
                    <>
                      <h4 className="sub-heading">
                        Please upload a valid <strong>.mp4</strong>,{' '}
                        <strong>.ogg</strong> or
                        <strong> .WebM</strong> file to convert it to a GIF.
                      </h4>

                      {video && (
                        <div className="video-container">
                          <h5 className="video-preview-label">
                            Video Preview:
                          </h5>
                          <video
                            className="video-preview"
                            controls
                            src={URL.createObjectURL(video)}
                          ></video>
                        </div>
                      )}

                      <form className="conversion-form">
                        {!video && (
                          <CardActions>
                            <Button
                              variant="contained"
                              component="label"
                              color="primary"
                            >
                              Upload File
                              <input
                                type="file"
                                hidden
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => handleVideoUpload(e)}
                              />
                            </Button>
                          </CardActions>
                        )}

                        {video && (
                          <CardActions className="button-row">
                            <Button
                              className="app-button"
                              variant="contained"
                              onClick={convertToGif}
                              color="primary"
                            >
                              Convert To GIF
                            </Button>
                            <Button
                              variant="contained"
                              component="label"
                              className="app-button"
                            >
                              Change File
                              <input
                                type="file"
                                hidden
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => handleVideoUpload(e)}
                              />
                            </Button>
                          </CardActions>
                        )}
                      </form>
                    </>
                  )}
                  {gif && (
                    <div className="converted-gif-container">
                      <h3 className="success-text">
                        🌟 Done. Here's your GIF!🌟
                      </h3>
                      <img
                        src={gif}
                        alt="converted gif"
                        className="converted-gif"
                      />
                    </div>
                  )}{' '}
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="content-loader">
            <CardContent>
              <div className="loader-container">
                <h1 className="heading">Loading...⌛</h1>
              </div>
            </CardContent>
          </Card>
        )}{' '}
      </div>{' '}
    </>
  );
};

export default App;
