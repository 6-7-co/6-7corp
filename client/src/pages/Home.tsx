import { Hero } from '../sections/Hero';
import { About } from '../sections/About';
import { Services } from '../sections/Services';
import { Projects } from '../sections/Projects';
import { Team } from '../sections/Team';
import { JournalPreview } from '../sections/JournalPreview';
import { ContactCTA } from '../sections/ContactCTA';

export function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Projects />
      <Team />
      <JournalPreview />
      <ContactCTA />
    </>
  );
}
