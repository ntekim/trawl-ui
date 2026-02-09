import React, { useState } from 'react';
import {
  ChakraProvider,
  Box,
  Flex,
  Heading,
  Text,
  Image,
  VStack,
  HStack,
  IconButton,
  Container,
  Grid,
  Spinner,
  Button
} from '@chakra-ui/react';
import { system } from './theme'; 
import { 
  InstantSearch, 
  SearchBox, 
  useHits,
  RefinementList, 
  Pagination,
  useInstantSearch,
  useSearchBox,
  Chat
} from 'react-instantsearch';
import { algoliasearch } from 'algoliasearch';
import { Mic, Play, Star, Calendar, Search } from 'lucide-react';

// --- CONFIGURATION ---
const searchClient = algoliasearch(
  process.env.REACT_APP_ALGOLIA_APP_ID, 
  process.env.REACT_APP_ALGOLIA_SEARCH_ONLY_KEY
);

// --- HELPER: PROGRAMMATIC CHAT OPEN ---
const openCineAgent = () => {
  const chatButton = document.querySelector('.ais-ChatToggleButton');
  if (chatButton) chatButton.click();
};

// --- MOVIE CARD ---
const MovieHit = ({ hit }) => (
  <Box position="relative" borderRadius="xl" overflow="hidden" bg="#111" transition="all 0.3s" _hover={{ transform: 'scale(1.05)', zIndex: 10 }}>
    <Box aspectRatio="2/3" position="relative"> 
      <Image src={hit.image_url || 'https://via.placeholder.com/400x600'} alt={hit.title} w="100%" h="100%" fit="cover" />
      <Box position="absolute" inset="0" bgGradient="to-t" gradientFrom="black" gradientTo="transparent" opacity="0.9" />
      <VStack position="absolute" bottom="0" p="3" align="start" gap="0.5" w="100%">
        <Text color="white" fontWeight="bold" fontSize="xs" noOfLines={1}>{hit.title}</Text>
        <HStack gap="3" fontSize="10px" color="gray.500">
            <HStack gap="1"><Calendar size={10} /> <Text>{hit.year}</Text></HStack>
            <HStack gap="1" color="yellow.400"><Star size={10} fill="currentColor" /> <Text fontWeight="bold">{hit.rating}</Text></HStack>
        </HStack>
      </VStack>
    </Box>
  </Box>
);

const CustomHits = () => {
  const { hits } = useHits();
  return (
    <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)', xl: 'repeat(6, 1fr)' }} gap="4">
      {hits.map((hit) => <MovieHit key={hit.objectID} hit={hit} />)}
    </Grid>
  );
};

// --- VOICE SEARCH (Fixed Icon & Logic) ---
const VoiceSearch = () => {
  const { refine } = useSearchBox();
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported in this browser.");

    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      refine(transcript);
      if (transcript.split(' ').length > 3) openCineAgent();
    };
    recognition.start();
  };

  return (
    <IconButton 
      aria-label="Mic" 
      variant="ghost" 
      onClick={startListening}
      color={isListening ? "red.500" : "blue.400"}
    >
      <Mic size={20} />
    </IconButton>
  );
};

const NoResultsBoundary = ({ children }) => {
  const { results, status } = useInstantSearch();
  if (status === 'loading') return <Flex justify="center" py="40"><Spinner color="blue.500" /></Flex>;
  if (results && results.nbHits === 0) {
    return (
      <VStack py="20" px="6" textAlign="center" bg="whiteAlpha.50" borderRadius="2xl" border="1px dashed" borderColor="whiteAlpha.200" w="100%">
        <Search size={30} color="gray" />
        <Heading size="sm" color="white">Movie not found</Heading>
        <Button colorPalette="blue" rounded="full" size="sm" onClick={openCineAgent} mt="4">
          Ask AI Assistant
        </Button>
      </VStack>
    );
  }
  return children;
};

export default function App() {
  return (
    <ChakraProvider value={system}>
      <Box minH="100vh" bg="#000" color="white">
        <InstantSearch searchClient={searchClient} indexName="cine_agent" future={{ preserveSharedStateOnUnmount: true }}>
          
          <Box position="sticky" top="0" bg="rgba(0,0,0,0.95)" backdropFilter="blur(10px)" zIndex="1000" borderBottom="1px solid" borderColor="whiteAlpha.100">
            <Container maxW="8xl" py="4">
              <Flex align="center" justify="space-between" gap={4}>
                <HStack gap="3" cursor="pointer" onClick={() => window.location.reload()}>
                    <Box bg="blue.600" p="2" borderRadius="md"><Play size={16} fill="white" /></Box>
                    <Heading size="md" tracking="tighter" hideBelow="sm">CINEAGENT</Heading>
                </HStack>

                <Flex flex="1" maxW="2xl" align="center" bg="#1A1A1A" borderRadius="full" px="3" border="1px solid" borderColor="whiteAlpha.200">
                    <Box flex="1">
                        <SearchBox placeholder="Search films..." classNames={{ input: 'clean-input', form: 'clean-form' }} />
                    </Box>
                    <VoiceSearch />
                </Flex>
                <Box w="40px" hideBelow="sm" />
              </Flex>
            </Container>
          </Box>

          <Container maxW="8xl" py="10">
            <Flex gap="12">
              <Box w="200px" shrink="0" hideBelow="md">
                <RefinementList attribute="year" limit={15} classNames={{ item: 'f-item', labelText: 'f-label', count: 'f-count' }} />
              </Box>
              <Box flex="1">
                <NoResultsBoundary>
                    <CustomHits />
                    <Flex justify="center" mt="10"><Pagination /></Flex>
                </NoResultsBoundary>
              </Box>
            </Flex>
          </Container>

          <Chat 
             agentId={process.env.REACT_APP_ALGOLIA_AGENT_ID} 
             templates={{ 
                item: () => '',      
                header: {
                  titleIcon: () => '',
                  titleText: 'CineAgent AI Assistant',
                }         
              }} 
          />
        </InstantSearch>
      </Box>

      <style>{`
          /* 1. HIDE THE RAW JSON DUMP ENTIRELY */
          .ais-Chat-hit, 
          .ais-Chat-citations, 
          .ais-Chat-message pre, 
          .ais-Chat-message code { 
            display: none !important; 
            visibility: hidden !important;
            height: 0 !important;
          }
        
          /* 2. FIX INPUT TEXT VISIBILITY (White background fix) */
          .ais-Chat-input {
            background-color: #ffffff !important;
            color: #1a202c !important; /* Forces black text on the white box */
            -webkit-text-fill-color: #1a202c !important;
            border: 1px solid #cbd5e0 !important;
            padding: 12px !important;
            font-size: 14px !important;
          }
        
          /* 3. SCROLLING FIX */
          .ais-Chat-list {
            overflow-y: auto !important;
            max-height: 100% !important;
            padding: 20px !important;
          }
        `}</style>
    </ChakraProvider>
  );
}
