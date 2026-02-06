import React from 'react';
import { Box, Text, Flex, IconButton, Portal } from '@chakra-ui/react';
import { InstantSearch, Chat } from 'react-instantsearch';
import { algoliasearch } from 'algoliasearch';
import { X } from 'lucide-react';

const chatClient = algoliasearch('8D8MDXM82F', '6b454c0c6835da737d8bbca45b2e2379');

const CineChat = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Portal>
      <Box position="fixed" inset="0" zIndex="10000" bg="blackAlpha.900" backdropFilter="blur(15px)" display="flex" alignItems="center" justifyContent="center" p={4}>
        <Box bg="#0A0A0A" w="full" maxW="2xl" h="80vh" borderRadius="3xl" border="1px solid" borderColor="whiteAlpha.200" display="flex" flexDirection="column" overflow="hidden">
          
          <Flex justify="space-between" align="center" p="5" borderBottom="1px solid" borderColor="whiteAlpha.100" bg="#111">
            <Flex align="center" gap="3">
              <Box w="2" h="2" bg="green.500" borderRadius="full" className="animate-pulse" />
              <Text fontWeight="bold" color="white">CineAgent AI Assistant</Text>
            </Flex>
            <IconButton variant="ghost" onClick={onClose} color="gray.500" _hover={{ color: "white" }} icon={<X size={20} />} />
          </Flex>

          {/* CHAT CONTAINER: Must have flex-1 and display flex */}
          <Box flex="1" bg="black" position="relative" display="flex" flexDirection="column">
            <InstantSearch searchClient={chatClient} indexName="cine_agent">
              <Chat 
                agentId="a8ca8916-3f10-4372-88fc-966f3cb104fa"
                cssClasses={{
                  root: 'chat-root-override',
                  messages: { scroll: 'chat-scroll-area' },
                  prompt: { textarea: 'chat-input-field' }
                }}
                templates={{
                  items: ()=>'', // Removes "Citations" section with JSON dump) 
                  header: () => '', // Removes white floating header
                  toggleButton: () => '', // Removes floating blue bubble
                }}
              />
            </InstantSearch>
          </Box>
        </Box>
      </Box>

      <style>{`
        /* FORCE CHAT VISIBILITY */
        .chat-root-override { 
          height: 100% !important; 
          display: flex !important; 
          flex-direction: column !important; 
        }
        
        .chat-scroll-area { 
          flex: 1 !important; 
          overflow-y: auto !important; 
          padding: 20px !important;
          background: black !important;
        }

        .chat-input-field {
          background: #1A1A1A !important;
          color: white !important;
          -webkit-text-fill-color: white !important;
          border: 1px solid #333 !important;
          border-radius: 12px !important;
          padding: 12px !important;
          margin: 15px !important;
          width: calc(100% - 30px) !important;
        }

        /* Message Bubble Styles */
        .ais-Chat-message--agent { background: #1A202C !important; color: white !important; border-radius: 4px 15px 15px 15px !important; border: 1px solid #333 !important; }
        .ais-Chat-message--user { background: #2563eb !important; color: white !important; border-radius: 15px 15px 4px 15px !important; }
        
        /* Hide Citations (JSON Dump) */
        .ais-Chat-hit, .ais-Chat-message pre { display: none !important; }
        
        /* Fix placeholder text */
        .ais-Chat-placeholderIcon { width: 40px !important; height: 40px !important; margin-bottom: 10px !important; }
      `}</style>
    </Portal>
  );
};

export default CineChat;