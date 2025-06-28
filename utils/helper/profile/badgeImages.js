// Badge image mapping function
export const getBadgeImagePath = (badgeName) => {
  const badgeImageMap = {
    "Clarity Seeker": "/assets/badges/Clarity Seeker.png",
    "Creative Catalyst": "/assets/badges/Creative Catalyst.png",
    "Growth Gardener": "/assets/badges/Growth Gardener.png",
    "Inner Voyager": "/assets/badges/Inner Voyager.png",
    "Insight Builder": "/assets/badges/Insight Builder.png",
    "Journaling Journeyer": "/assets/badges/Journaling Journeyer.png",
    "Mindful Explorer": "/assets/badges/Mindful Explorer.png",
    "Mirror Maven": "/assets/badges/Mirror Maven.png",
    "Productivity Pathfinder": "/assets/badges/Productivity Pathfinder.png",
    "Resilient Sage": "/assets/badges/Resilient Sage.png",
    "Solution Seer": "/assets/badges/Solution Seer.png",
    "Soul Architect": "/assets/badges/Soul Architect.png",
    "Theme Trailblazer": "/assets/badges/Theme Trailblazer.png",
    "Thought Weaver (Beginner)": "/assets/badges/Thought Weaver (Beginner).png",
    "Zen Master": "/assets/badges/Zen Master.png",
  };

  // Return the mapped image path or fallback to default
  return badgeImageMap[badgeName] || "/assets/Group 47671.png";
};
