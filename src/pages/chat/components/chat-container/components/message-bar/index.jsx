import { useSocket } from '@/context/SocketContext';
import apiClient from '@/lib/api-client';
import { useAppStore } from '@/store';
import { UPLOAD_FILE_ROUTE } from '@/utils/constants';
import EmojiPicker from 'emoji-picker-react';
import React, { useEffect, useRef, useState } from 'react'
import { GrAttachment } from "react-icons/gr";
import { IoSend } from 'react-icons/io5';
import { RiEmojiStickerLine } from 'react-icons/ri';
import { set } from './../../../../../../../node_modules/moment/src/lib/moment/get-set';
const MessageBar = () => {
    const emojiRef = useRef();
    const fileInputRef = useRef();
    const {
      selectedChatType,
      selectedChatData,
      userInfo,
      setIsUploading,
      setFileUploadProgress,
    } = useAppStore();
    const socket = useSocket();
    const [emojiPickerOpen, setemojiPickerOpen] = useState(false);
    const [message, setMessage] = useState('');



    useEffect(() => {
        function handleClickOutside(event) {
       if(emojiRef.current && !emojiRef.current.contains(event.target)){
              setemojiPickerOpen(false);
       }
    }
       document.addEventListener("mousedown",handleClickOutside);
       return () => {
              document.removeEventListener("mousedown",handleClickOutside);
         };
    }, []);
    const handleAddEmoji = (emoji) => {
        setMessage(message + emoji.emoji);
    };
    const handleSendMessage = async () => {
      if (!message.trim()) return;

      const payload = {
        sender: userInfo.id,
        content: message,
        messageType: "text",
        fileUrl: undefined,
      };

      if (selectedChatType === "contact") {
        socket.emit("sendMessage", {
          ...payload,
          recipient: selectedChatData._id,
        });
      } else if (selectedChatType === "channel") {
        socket.emit("send-channel-message", {
          ...payload,
          channelId: selectedChatData._id,
        });
      }

      setMessage("");
    };
    

    const handleAttachmentClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }
    const handleAttachmentChange = async (event) => {
      try {
        const file = event.target.files[0];
        console.log("Selected file:", file);
        if(file){
          const formData = new FormData();
          formData.append('file', file);
          setIsUploading(true);

          const response = await apiClient.post(UPLOAD_FILE_ROUTE,formData,{
            withCredentials: true,
            onUploadProgress:data=>{
              setFileUploadProgress(Math.round((data.loaded * 100) / data.total));
            },
          });
          if(response.status===200 && response.data){
            setIsUploading(false);
              if(selectedChatType === "contact") {
              socket.emit("sendMessage", {
                sender: userInfo.id,
                content: undefined,
                recipient: selectedChatData._id,
                messageType: "file",
                fileUrl: response.data.filePath,
              });
            }
            else if(selectedChatType === "channel") {
              socket.emit("send-channel-message", {
                sender: userInfo.id,
                content: undefined,
                messageType: "file",
                fileUrl: response.data.filePath,
                channelId: selectedChatData._id,
              });
            }
          }
        }

      } catch (error) {
        setIsUploading(false);
        console.error("Error uploading file:", error);
      }
    }
        

  return (
    <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6">
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
        <input
          type="text"
          className="flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none  "
          placeholder="Enter message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 
        transition-all"
        onClick={handleAttachmentClick}
        >
          <GrAttachment className="text-2xl" />
        </button>
        <input type="file" className='hidden' ref={fileInputRef} onChange={handleAttachmentChange} />
        <div className="relative">
          <button
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
            onClick={() => setemojiPickerOpen(true)}
          >
            <RiEmojiStickerLine className="text-2xl" />
          </button>
          <div className="absolute bottom-16 right-0" ref={emojiRef}>
            <EmojiPicker
              theme="dark"
              open={emojiPickerOpen}
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
            />
          </div>
        </div>
      </div>
      <button
        className="bg-[#8417ff] rounded-md flex items-center justify-center p-5 hover:bg-[#741bda] focus:bg-[#741bda] focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
        onClick={handleSendMessage}
      >
        <IoSend className="text-2xl" />
      </button>
    </div>
  );
}

export default MessageBar
