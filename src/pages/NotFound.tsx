import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import Container from '../components/common/Container';
import Heading from '../components/common/Heading';
import Button from '../components/common/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-center justify-center py-24 bg-[#0A0A0A] text-white">
      <Container>
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-8">
          
          {/* Gigantic tilted 404 banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative"
          >
            <h1 className="text-[12rem] md:text-[18rem] font-black italic -skew-x-12 leading-none text-zinc-800 tracking-tighter select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl md:text-2xl font-black uppercase tracking-[0.4em] text-brand-orange bg-[#0A0A0A] px-6 py-2 border border-brand-orange/40 transform -skew-x-12">
                PORT BLOCKED_
              </span>
            </div>
          </motion.div>

          <Heading
            level={2}
            title="Lost in the Showcase"
            subtitle="LookVerse 404 Error"
            align="center"
            className="text-white"
          />

          <p className="text-zinc-400 text-sm md:text-base max-w-md leading-relaxed italic border-l-2 border-brand-orange/40 pl-6 mx-auto">
            The sneaker or page you are looking for has either hopped off the deck or was never in stock. Let's redirect you back to the main lobby.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="primary" size="md" onClick={() => navigate('/')}>
              Return to Lobby
            </Button>
            <Button variant="outline" size="md" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>

        </div>
      </Container>
    </div>
  );
};
export default NotFound;
