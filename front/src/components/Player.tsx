import React from 'react';
import { Player } from 'video-react';

export const LiveScreen = () => {
  return (
    <>
    <link rel="stylesheet" href="https://video-react.github.io/assets/video-react.css" />
      <Player>
        <source src="https://media.w3.org/2010/05/sintel/trailer_hd.mp4" />
      </Player>
    </>
  )
}
