import React, { useEffect, useRef, useState } from 'react'
import  {hightlightsSlides}  from '../constants'
import { pauseImg, playImg, replayImg } from '../utils';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
const VideoCoursel = () => {
    const videoRef = useRef([]);
    const videoSpanRef = useRef([]);
    const videoDivRef = useRef([]);

    const [video , setVideo] = useState({
        isEnd: false,
        startPlay: false,
        videoId: 0,
        isLastVideo:false,
        isPlaying:false
    })

    const [loadedData , setLoadedData] = useState([]);

    const {isEnd , isLastVideo ,startPlay ,videoId , isPlaying} = video;

    useGSAP(() => {

        gsap.to('#slider', {
            transform:`translateX(${-100 * videoId}%)`,
            duration: 2,
            ease: 'power2.inOut'
        })

        gsap.to('#video' , {
            scrollTrigger: {
                trigger: '#video',
                toggleActions:'restart none none none '
            },

            onComplete: () => {
                setVideo((preVideo) => ({
                    ...preVideo,
                    startPlay: true,
                    isPlaying: true
                }))
            }
        })
    }, [isEnd , videoId])

    useEffect(() => {
        if(loadedData.length > 3){
            if(!isPlaying){
                videoRef.current[videoId].pause();
            }else{
                startPlay && videoRef.current[videoId].play();
            }
        }
    },[startPlay , videoId , isPlaying , loadedData])

    const handleLoadedMetaData = (i ,e) => setLoadedData((preVideo) => [...preVideo , e]) 

    useEffect(() => {
        let currentProgress = 0 ;
        let span = videoSpanRef.current;
        if(span[videoId]){
            //animate the progress of the video..
            let anim = gsap.to(span[videoId] , {
                onUpdate: () => {
                    const progress = Math.ceil(anim.progress() * 100);

                    if(progress != currentProgress){
                        currentProgress = progress;
                        gsap.to(videoDivRef.current[videoId] , {
                            width: window.innerWidth < 760 
                            ? '10vw'
                            : window.innerWidth < 1200 
                            ? '10vw'
                            : '4vw'
                        })

                        gsap.to(span[videoId] , {
                            width: `${currentProgress}%`,
                            backgroundColor: 'white'
                        })
                    }
                },


                onComplete: () => {
                    if(isPlaying){
                        gsap.to(videoDivRef.current[videoId], {
                            width: '12px'
                        })
                        gsap.to(span[videoId] ,{
                            backgroundColor: '#afafaf'
                        })
                    }
                }
            })
        
            if(videoId === 0){
                anim.restart();
            }

            const animUpdate = () => {
                anim.progress (videoRef.current[videoId].currentTime / hightlightsSlides[videoId].videoDuration)
            }
    
            if(isPlaying){
                gsap.ticker.add(animUpdate)
            }else{
                gsap.ticker.remove(animUpdate)
            }

        }

    }, [videoId,startPlay])

    const handleProcess = (type , i) => {
        switch (type) {
            case 'video-end':
                setVideo((preVideo) => ({...preVideo, isEnd: true , videoId:i +1}))
                break;

            case 'video-last':
                setVideo((preVideo) => ({...preVideo , isLastVideo: true}))
                break;

            case 'video-reset':
                setVideo((preVideo) => ({...preVideo , isLastVideo: false , videoId: 0}))
                break;

            case 'play':
                 setVideo((preVideo) => ({...preVideo , isPlaying: !preVideo.isPlaying }))
                 break;

            case 'pause':
                 setVideo((preVideo) => ({...preVideo , isPlaying: !preVideo.isPlaying }))
                 break;
        
            default:
                return video;
        }
    }
  return (
    <>
      <div className='flex items-center'>
        {hightlightsSlides.map((list, i) => (
            <div key={list.id} id="slider" className='sm:pr-20 pr-10'>
                <div className='relative sm:w-[70vw] w-[88vw] md:h-[70vh] sm:h-[50vh] h-[35vh]'>
                    <div className='w-full h-full flex items-center justify-center rounded-3xl overflow-hidden bg-black'>
                        <video id="video" className={`${list.id === 2 && 'translate-x-44'} pointer-events-none`} playsInline={true} preload='auto' muted ref={(element) => (videoRef.current[i] = element)} onEnded = {() => {
                            i !== 3
                            ? handleProcess('video-end' , i)
                            : handleProcess('video-last')
                        }} onPlay={() => {
                            setVideo((preVideo) => ({
                                ...preVideo , isPlaying: true
                            }))
                        }} onLoadedMetadata={(e) => handleLoadedMetaData(i ,e)} >
                            <source src={list.video} type="video/mp4"/>
                        </video>
                    </div>
                    <div className='absolute top-12 left-[5%] z-10'>
                        {list.textLists.map((text) => (
                            <p key={text} className='md:text-2xl text-xl font-medium'>
                                {text}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        ))}
      </div>
      <div className='relative flex items-center justify-center mt-10'>
        <div className='flex items-center justify-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full'>
            {videoRef.current.map((_ , i) => (
                <span key={i} ref = {(element) => (videoDivRef.current[i] = element)} className='mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer'>
                    <span className='absolute h-full w-full rounded-full' ref = {(element) => (videoSpanRef.current[i] = element)} />
                </span>
            ))}
        </div>
        <button className='ml-4 p-4 rounded-full bg-gray-300 backdrop-blur flex items-center justify-center'>
            <img src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg} alt={isLastVideo ? 'replay' : !isPlaying ? 'play' : 'pause'} onClick={isLastVideo ? () => handleProcess('video-reset') : !isPlaying ? () => handleProcess('play') : () => handleProcess('pause')}/>
        </button>
      </div>
    </>
  )
}

export default VideoCoursel
