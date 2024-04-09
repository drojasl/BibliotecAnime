import Icon from '@mdi/react';
import { mdiPlayCircleOutline , mdiEarth, mdiMagnify, mdiPlaylistMusic, mdiLogin, mdiPlusCircleOutline  } from '@mdi/js';
import { Tooltip } from 'react-tooltip'

export const Navbar = () => {
  return (
    <>
    <div className="flex flex-col justify-between pr-5">
      <div>LOGO</div>
      <div className="rounded-full p-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', height: 'fit-content' }}>
        <div className="my-3">
          <div className="hover:cursor-pointer hover:bg-white hover:bg-opacity-50 text-white rounded-full flex justify-center items-center p-1" data-tooltip-id="toolTip" data-tooltip-content="For you"><Icon path={mdiPlayCircleOutline} size={0.7} /></div>
        </div>
        <div className="my-3">
          <div className="hover:cursor-pointer hover:bg-white hover:bg-opacity-50 text-white rounded-full flex justify-center items-center p-1" data-tooltip-id="toolTip" data-tooltip-content="Explore"><Icon path={mdiEarth} size={0.7} /></div>
        </div>
        <div className="my-3">
          <div className="hover:cursor-pointer hover:bg-white hover:bg-opacity-50 text-white rounded-full flex justify-center items-center p-1" data-tooltip-id="toolTip" data-tooltip-content="Your playlists"><Icon path={mdiPlaylistMusic} size={0.7} /></div>
        </div>
        <div className="my-3">
          <div className="hover:cursor-pointer hover:bg-white hover:bg-opacity-50 text-white rounded-full flex justify-center items-center p-1" data-tooltip-id="toolTip" data-tooltip-content="Search"><Icon path={mdiMagnify} size={0.7} /></div>
        </div>        
      </div>
      <div>
        <div className="rounded-full p-2 mb-3" style={{ backgroundColor: '#483ea8', height: 'fit-content' }} data-tooltip-id="toolTip" data-tooltip-content="Add song">
          <div className="hover:cursor-pointer text-white rounded-full flex justify-center items-center p-1" ><Icon path={mdiPlusCircleOutline} size={0.7} /></div>
        </div>
        <div className="rounded-full p-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', height: 'fit-content' }} data-tooltip-id="toolTip" data-tooltip-content="Log in">
          <div className="hover:cursor-pointer text-white rounded-full flex justify-center items-center p-1" ><Icon path={mdiLogin} size={0.7} /></div>
        </div>
      </div>
      </div>
          <Tooltip id="toolTip" effect="solid" place="top" style={{ backgroundColor: 'white', color: 'black', fontSize: '14px', zIndex:'1000', }} />
    </>
  );
};
