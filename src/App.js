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
import { liteClient } from 'algoliasearch/lite';
import { 
  InstantSearch, 
  SearchBox, 
  useHits,
  RefinementList, 
  Pagination,
  useInstantSearch,
  useSearchBox // Using this to link voice to search
} from 'react-instantsearch';
import { Mic, MessageSquare, Play, Search } from 'lucide-react';
import CineChat from './CineChat';

const searchClient = liteClient('8D8MDXM82F', '6b454c0c6835da737d8bbca45b2e2379');

const MovieHit = ({ hit }) => (
  <Box position="relative" borderRadius="xl" overflow="hidden" bg="#111" transition="all 0.3s" _hover={{ transform: 'scale(1.05)', zIndex: 10 }}>
    <Box aspectRatio="2/3" position="relative"> 
      <Image src={hit.image_url || 'https://via.placeholder.com/400x600'} alt={hit.title} w="100%" h="100%" fit="cover" />
      <Box position="absolute" inset="0" bgGradient="to-t" gradientFrom="black" gradientTo="transparent" opacity="0.9" />
      <VStack position="absolute" bottom="0" p="3" align="start" gap="0.5" w="100%">
        <Text color="white" fontWeight="bold" fontSize="xs" noOfLines={1}>{hit.title}</Text>
        <HStack gap="3" fontSize="10px" color="gray.500">
          <Text>{hit.year}</Text>
          <Text color="yellow.500">★ {hit.rating}</Text>
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

const NoResultsBoundary = ({ children, onOpenChat }) => {
  const { results, status } = useInstantSearch();
  if (status === 'loading') return <Flex justify="center" py="40"><Spinner color="blue.500" /></Flex>;
  if (results && results.nbHits === 0) {
    return (
      <VStack py="20" px="6" textAlign="center" bg="whiteAlpha.50" borderRadius="2xl" border="1px dashed" borderColor="whiteAlpha.200">
        <Search size={30} color="gray" />
        <Heading size="sm" color="white">Movie Not Found</Heading>
        <Button colorPalette="blue" rounded="full" size="sm" onClick={onOpenChat} mt="4">Ask CineAgent AI</Button>
      </VStack>
    );
  }
  return children;
};

// --- CUSTOM VOICE COMPONENT ---
const VoiceSearchButton = ({ setVoiceText, onOpenChat }) => {
  const { refine } = useSearchBox();
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice not supported in this browser");

    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      refine(transcript); // Updates the movie grid
      setVoiceText(transcript); // Passes text to AI Chat
      onOpenChat(); // Opens the AI Chat
    };
    recognition.start();
  };

  return (
    <IconButton 
      aria-label="Voice Search" 
      variant="ghost" 
      onClick={startListening} 
      color={isListening ? "red.500" : "blue.400"}
      className={isListening ? "animate-pulse" : ""}
    >
      <Mic size={20} />
    </IconButton>
  );
};

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [voiceText, setVoiceText] = useState("");

  return (
    <ChakraProvider value={system}>
      <Box minH="100vh" bg="#000" color="white">
        <InstantSearch 
            searchClient={searchClient} 
            indexName="cine_agent"
            future={{ preserveSharedStateOnUnmount: true }}
        >
          {/* HEADER */}
          <Box position="sticky" top="0" bg="rgba(0,0,0,0.9)" backdropFilter="blur(10px)" zIndex="1000" borderBottom="1px solid" borderColor="whiteAlpha.100">
            <Container maxW="8xl" py="4">
              <Flex align="center" justify="space-between" gap={4}>
                <HStack gap="3" onClick={() => window.location.reload()} cursor="pointer">
                  <Box bg="blue.600" p="2" borderRadius="md"><Play size={16} fill="white" /></Box>
                  <Heading size="md" tracking="tighter" hideBelow="sm">CINEAGENT</Heading>
                </HStack>

                <Flex flex="1" maxW="2xl" align="center" bg="#111" borderRadius="full" px="3" border="1px solid" borderColor="whiteAlpha.200">
                  <Box flex="1">
                    <SearchBox placeholder="Search films or ask AI..." classNames={{ input: 'clean-input', form: 'clean-form' }} />
                  </Box>
                  <VoiceSearchButton setVoiceText={setVoiceText} onOpenChat={() => setIsChatOpen(true)} />
                </Flex>
              </Flex>
            </Container>
          </Box>

          <Container maxW="8xl" py="10">
            <Flex gap="12">
              <Box w="200px" shrink="0" hideBelow="md">
                <Heading size="xs" color="blue.500" mb="6" textTransform="uppercase">Years</Heading>
                <RefinementList attribute="year" limit={15} classNames={{ item: 'f-item', labelText: 'f-label', count: 'f-count' }} />
              </Box>

              <Box flex="1">
                <NoResultsBoundary onOpenChat={() => setIsChatOpen(true)}>
                    <CustomHits />
                    <Flex justify="center" mt="10"><Pagination /></Flex>
                </NoResultsBoundary>
              </Box>
            </Flex>
          </Container>

          <IconButton
            aria-label="Chat"
            colorPalette="blue"
            rounded="full"
            position="fixed"
            bottom="6"
            right="6"
            h="14"
            w="14"
            shadow="0 0 20px rgba(37, 99, 235, 0.4)"
            onClick={() => setIsChatOpen(true)}
            zIndex="2000"
          >
            <MessageSquare size={24} />
          </IconButton>

          <CineChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} voiceText={voiceText} />
        </InstantSearch>
      </Box>

      <style>{`
        .clean-form { background: transparent !important; border: none !important; box-shadow: none !important; }
        .clean-form::before { display: none !important; }
        .clean-input { 
            background: transparent !important; 
            border: none !important; 
            color: black !important; 
            padding: 10px 15px !important; 
            width: 100% !important;
            outline: none !important;
        }
        .ais-SearchBox-submit, .ais-SearchBox-reset { display: none !important; }
        .f-item { display: flex; align-items: center; padding: 5px 0; font-size: 13px; color: #718096; }
        .f-label { flex: 1; cursor: pointer; margin-left: 8px; }
        .f-count { font-size: 10px; background: #111; padding: 1px 5px; border-radius: 3px; }
        .ais-Pagination-list { display: flex; gap: 8px; list-style: none; justify-content: center; }
        .ais-Pagination-link { background: #111; padding: 8px 15px; border-radius: 8px; font-size: 13px; color: #4A5568; text-decoration: none; }
        .ais-Pagination-item--selected .ais-Pagination-link { background: #2563eb; color: white; }
      `}</style>
    </ChakraProvider>
  );
}