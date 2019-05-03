// @flow

import React, { Component } from 'react';
import fs from 'fs';
import base64ImageToFile from 'base64image-to-file';
import CircularProgressbar from 'react-circular-progressbar';
import gifshot from 'gifshot';
import path from 'path';
import styles from './Home.css';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeDropZone: false,
      captureProgress: null,
      saving: false
    };
  }

  ondragover = e => {
    const { activeDropZone } = this.state;
    if (e.dataTransfer.items.length === 1) {
      e.preventDefault();
      if (!activeDropZone) {
        this.setState({ activeDropZone: true });
      }
    }
    return false;
  };

  ondrop = e => {
    e.preventDefault();
    const { activeDropZone, saving } = this.state;
    if (activeDropZone) {
      this.setState({ activeDropZone: false });
    }
    const filePath = e.dataTransfer.files[0].path;
    const output = path.join(
      filePath
        .split('/')
        .reverse()
        .slice(1)
        .reverse()
        .join('/')
    );
    gifshot.createGIF(
      {
        gifWidth: 300,
        gifHeight: 300,
        video: filePath,
        interval: 0.1,
        numFrames: 10,
        frameDuration: 2,
        sampleInterval: 20,
        numWorkers: 100,
        progressCallback: captureProgress => {
          this.setState({ captureProgress });
          if (captureProgress === 1) {
            this.setState({ captureProgress: null });
          }
          if (!saving) {
            this.setState({ saving: true });
          }
        }
      },
      obj => {
        if (!obj.error) {
          base64ImageToFile(
            obj.image,
            output,
            `${filePath.split('/')
              .splice(-1, 1)[0]}-${Math.floor(Math.random() * 899999 + 100000)}`,
            () => {
              this.setState({ saving: false });
            }
          );
        }
      }
    );
  };

  ondragleave = e => {
    e.preventDefault();
    const { activeDropZone } = this.state;
    if (activeDropZone) {
      this.setState({ activeDropZone: false });
    }
    return false;
  };

  render() {
    const { activeDropZone, captureProgress, saving } = this.state;
    return (
      <div
        onDragOver={this.ondragover}
        onDrop={this.ondrop}
        onDragLeave={this.ondragleave}
        className={styles.container}
        style={{ border: activeDropZone ? '5px solid #2f7cf6' : 'none' }}
      >
        {
          captureProgress
            ? <div className={styles.progressbarWrapper}>
              <CircularProgressbar
                percentage={Math.round(captureProgress * 100 * 10) / 10}
                text={`${Math.round(captureProgress * 100 * 10) / 10}%`}
                strokeWidth={2}
                styles={{
                  text: {
                    fill: '#2f7cf6',
                    dominantBaseline: 'middle',
                    textAnchor: 'middle'
                  },
                  path: {
                    stroke: '#2f7cf6'
                  },
                  trail: {
                    stroke: 'transparent'
                  }
                }}
              />
            </div>
            : saving ? <p>Saving...</p>
            : <p>Drop a Video to Convert to GIF</p>
        }
      </div>
    );
  }
}
