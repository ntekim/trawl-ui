import React from 'react';
import { Box, Text, Flex, IconButton, Portal, Image, HStack } from '@chakra-ui/react';
import { InstantSearch, Chat } from 'react-instantsearch';
import { liteClient } from 'algoliasearch/lite';
import { X } from 'lucide-react';

const chatClient = liteClient('8D8MDXM82F', '6b454c0c6835da737d8bbca45b2e2379');

// --- CITATION CARD (Fixes the JSON dump) ---
const ChatMovieCitation = ({ hit }) => (
  <HStack gap="3" p="2" bg="whiteAlpha.100" borderRadius="lg" my="2" border="1px solid" borderColor="whiteAlpha.200">
    <Image 
      src={hit.image_url} 
      w="35px" 
      h="50px" 
      borderRadius="md" 
      fit="cover" 
      fallbackSrc="https://via.placeholder.com/40"
    />
    <Box flex="1">
      <Text color="white" fontSize="11px" fontWeight="bold" noOfLines={1}>{hit.title}</Text>
      <Text color="gray.500" fontSize="9px">{hit.year} • ★ {hit.rating}</Text>
    </Box>
  </HStack>
);

const CineChat = ({ isOpen, onClose, voiceText }) => {
  if (!isOpen) return null;

  return (
    <Portal>
      <Box position="fixed" inset="0" zIndex="10000" bg="blackAlpha.900" backdropFilter="blur(15px)" display="flex" alignItems="center" justifyContent="center" p={4}>
        <Box bg="#050505" w="full" maxW="2xl" h="85vh" borderRadius="3xl" border="1px solid" borderColor="whiteAlpha.200" display="flex" flexDirection="column" overflow="hidden" shadow="0 0 80px rgba(0,0,0,0.8)">
          
          {/* Header */}
          <Flex justify="space-between" align="center" p="5" borderBottom="1px solid" borderColor="whiteAlpha.100" bg="#0A0A0A">
            <Flex align="center" gap="3">
              <Box w="2" h="2" bg="green.500" borderRadius="full" className="animate-pulse" />
              <Text fontWeight="bold" color="white" letterSpacing="tight">CineAgent AI Assistant</Text>
            </Flex>
            <IconButton aria-label="Close" variant="ghost" onClick={onClose} color="gray.500" _hover={{ color: "white" }}><X size={20} /></IconButton>
          </Flex>

          {/* Chat Interface */}
          <Box flex="1" overflow="hidden" bg="black" position="relative">
            <InstantSearch searchClient={chatClient} indexName="cine_agent">
              <Chat 
                agentId="4ddf0636-38b2-4578-a98f-8715efde81ca"
                hitComponent={ChatMovieCitation} // USES THE COMPONENT NOW
                cssClasses={{
                  root: 'chat-root',
                  messages: { 
                    scroll: 'chat-scroll-area',
                    content: 'chat-content-list'
                  },
                  prompt: { textarea: 'chat-input-field' }
                }}
                templates={{
                    header: {
                        titleIcon: () => '', // Removes giant white circle
                        titleText: 'AI assistant active',
                    }
                }}
              />
            </InstantSearch>
          </Box>
          
          {voiceText && (
             <Box bg="blue.600" p="2"><Text fontSize="xs" textAlign="center" color="white" fontWeight="bold">Listening: "{voiceText}"</Text></Box>
          )}
        </Box>
      </Box>

      {/* THE "UI EXORCISM" CSS */}
      <style>{`
        /* 1. FIX TYPING BOX (Crucial for Dark Mode) */
        .chat-input-field {
          background: #1A1A1A !important;
          color: white !important;
          -webkit-text-fill-color: black !important;
          border: 1px solid #333 !important;
          border-radius: 12px !important;
          padding: 12px !important;
          width: calc(100% - 30px) !important;
          margin: 15px !important;
          font-size: 15px !important;
        }

        /* 2. FORCE SCROLLING */
        .chat-scroll-area {
          height: 100% !important;
          overflow-y: auto !important;
          background: black !important;
          display: flex !important;
          flex-direction: column !important;
        }

        .chat-content-list {
          padding: 20px !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 15px !important;
        }

        /* 3. FIX GIANT ICON */
        .ais-Chat-placeholderIcon { 
            width: 48px !important; 
            height: 48px !important; 
            margin: 0 auto 10px auto !important;
            display: block !important;
        }

        /* 4. MESSAGE BUBBLES */
        .ais-Chat-message--agent { 
            background: #1A202C !important; 
            color: white !important; 
            border-radius: 4px 15px 15px 15px !important; 
            border: 1px solid #2D3748 !important;
        }
        .ais-Chat-message--user { 
            background: #2563eb !important; 
            color: white !important; 
            border-radius: 15px 15px 4px 15px !important; 
            align-self: flex-end !important;
        }

        /* 5. HIDE RAW CODE/PRE BLOCKS */
        .ais-Chat-message pre, .ais-Chat-message code { display: none !important; }
        .ais-Chat-header { display: none !important; }
      `}</style>
    </Portal>
  );
};

export default CineChat;