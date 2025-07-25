import React, { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { FaPlus } from "react-icons/fa";
import { Input } from "@/components/ui/input";

import apiClient from "@/lib/api-client";
import { CREATE_CHANNEL_ROUTE, GET_ALL_CONTACTS_ROUTES, SEARCH_CONTACTS_ROUTES } from "@/utils/constants";

import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multipleselect";

const CreateChannel = () => {
  const { setSelectedChatType, setSelectedChatData,addChannel } = useAppStore();
  const [newChannelModal, setNewChannelModal] = useState(false);

  const [AllContacts,setAllContacts]=useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [channelName, setChannelName] = useState([]);


  useEffect(()=>{
    const getData = async()=>{
        const response = await apiClient.get(GET_ALL_CONTACTS_ROUTES,{
            withCredentials: true,
        });
        setAllContacts(response.data.contacts);
    };
    getData();
  },[]);
  
  const createChannel = async()=>{
    try {
        if(channelName.length>0 && selectedContacts.length > 0){
            const response = await apiClient.post(
              CREATE_CHANNEL_ROUTE,
              {
                name:channelName,
                members: selectedContacts.map((contact) => contact.value),
              },
              { withCredentials: true }
            );
            if(response.status===201){
                setChannelName("");
                setSelectedContacts([]);
                setNewChannelModal(false);
                addChannel(response.data.channel);

            }

        }
        
    } catch (error) {
      console.log(error);
        
    }
  };


  const searchContacts = async (searchTerm) => {
    try {
      if (searchTerm.length > 0) {
        const response = await apiClient.post(
          SEARCH_CONTACTS_ROUTES,
          { searchTerm },
          { withCredentials: true }
        );
        if (response.status === 200 && response.data.contacts) {
          setSearchedContacts(response.data.contacts);
        }
      } else {
        setSearchedContacts([]);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const selectNewContact = (contact) => {
    setNewChannelModal(false);
    setSelectedChatType("contact");
    setSelectedChatData(contact);
    setSearchedContacts([]);
  };
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className="text-neutral-400 font-light text-opacity-90 text-small hover:text-neutral-100 cursor-pointer translate-all duration-300 "
              onClick={() => setNewChannelModal(true)}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
            Create New Channel
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={newChannelModal} onOpenChange={setNewChannelModal}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Please fill up the details for new channel</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="Channel Name"
              className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              onChange={(e) => setChannelName(e.target.value)}
              value={channelName}
            />
          </div>
          <div>
            <MultipleSelector
            className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
            defaultOptions={AllContacts}
            placeholder="Search Contacts"
            onChange={setSelectedContacts}
            emptyIndicator={
                <p className="text-center text-lg leading-10 text-gray-600">No Results Found.</p>
            }
            />
          </div>
          <div>
            <Button className='w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300'
            onClick={createChannel}
            >Create Channel</Button>
          </div>
        
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateChannel;
