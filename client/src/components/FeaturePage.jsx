import React from 'react';
import FeatureCard from './FeatureCard';
import verifiedIcon from '../assets/verifiedProfiles.png';
import aegisRating from '../assets/aegisRating.png';
import recruitmentIcon from '../assets/recruitment.png';
import insightsIcon from '../assets/insights.png';

const features = [
  {
    icon: verifiedIcon,
    title: 'Verified Profiles',
    description: 'Build your ultimate esports resume. Your profile features API-verified stats to prove your skill and a dedicated space for your most clutch gameplay moments.',
  },
  {
    icon: aegisRating,
    title: 'Aegis rating',
    description: 'Go beyond in-game ranks. Our unique Elo system is calculated purely from official tournament performances, creating the most accurate measure of your competitive skill.',
  },
  {
    icon: recruitmentIcon,
    title: 'Recruitment',
    description: 'Apply directly to vacancies from top organizations or get discovered by recruiters searching for your specific role and rank.',
  },
  {
    icon: insightsIcon,
    title: 'Esports Insights',
    description: 'Stay ahead of the competition. Access our comprehensive database of tournament schedules, results, and prize stats, and detailed player stats and Aegis Ratings.',
  },
];

// function FeaturePage() {
//   return (
//     <div className="flex flex-col p-8">
//       <h1 className="text-4xl text-center text-white mb-8">OUR FEATURES</h1>
//       <div className="flex flex-wrap justify-center gap-6">
//         {features.map((feature, index) => (
//           <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} />
//         ))}
//       </div>
//     </div>
//   );
// }

function FeaturePage() {
  return (
    <div className="flex flex-col p-8 justify-center">
      <h1 className="text-4xl text-center text-white mb-8 font-irish-grover font-extrabold">OUR FEATURES</h1>
      <div className='flex justify-center gap-10'>
            {features.map((feature, index) => (
           <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} />
         ))}
      </div>
    </div>
  );
}


export default FeaturePage;
