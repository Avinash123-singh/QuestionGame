import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Casino as CasinoIcon,
  RocketLaunch as RocketLaunchIcon,
  Groups as GroupsIcon,
  Celebration as CelebrationIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  Nightlife as NightlifeIcon,
  LocalBar as LocalBarIcon,
  SportsBar as SportsBarIcon,
  Cake as CakeIcon,
  MusicNote as MusicNoteIcon,
  TheaterComedy as TheaterComedyIcon,
  Settings as SettingsIcon,
  Tune as TuneIcon,
  Build as BuildIcon,
  Dashboard as DashboardIcon,
  AddCircle as AddCircleIcon,
  MeetingRoom as MeetingRoomIcon,
  Password as PasswordIcon,
  Key as KeyIcon,
  Engineering as EngineeringIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  DoorFront as DoorFrontIcon,
  VpnKey as VpnKeyIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Share as ShareIcon,
  Link as LinkIcon,
  ContentCopy as ContentCopyIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Wifi as WifiIcon,
  Hub as HubIcon,
  Sync as SyncIcon,
  Campaign as CampaignIcon,
  Forum as ForumIcon,
  PersonPin as PersonPinIcon,
  Edit as EditIcon,
  Create as CreateIcon,
  Draw as DrawIcon,
  Lightbulb as LightbulbIcon,
  Psychology as PsychologyIcon,
  AutoStories as AutoStoriesIcon,
  FactCheck as FactCheckIcon,
  Quiz as QuizIcon,
  RateReview as RateReviewIcon,
  TextFields as TextFieldsIcon,
  Title as TitleIcon,
  Spellcheck as SpellcheckIcon,
  HowToVote as HowToVoteIcon,
  Ballot as BallotIcon,
  ThumbUp as ThumbUpIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  GpsFixed as GpsFixedIcon,
  FilterList as FilterListIcon,
  Rule as RuleIcon,
  CompareArrows as CompareArrowsIcon,
  TouchApp as TouchAppIcon,
  Plagiarism as PlagiarismIcon,
  EmojiEvents as EmojiEventsIcon,
  MilitaryTech as MilitaryTechIcon,
  Leaderboard as LeaderboardIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  TrendingUp as TrendingUpIcon,
  Grade as GradeIcon,
  Diamond as DiamondIcon,
  Redeem as RedeemIcon,
  AvTimer as AvTimerIcon,
  Score as ScoreIcon,
  Poll as PollIcon,
  StackedBarChart as StackedBarChartIcon,
  Help as HelpIcon,
  MenuBook as MenuBookIcon,
  School as SchoolIcon,
  TipsAndUpdates as TipsAndUpdatesIcon,
  Info as InfoIcon,
  PlayCircle as PlayCircleIcon,
  ListAlt as ListAltIcon,
  Support as SupportIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Assignment as AssignmentIcon,
  ImportContacts as ImportContactsIcon,
  LiveHelp as LiveHelpIcon,
} from '@mui/icons-material';

const FloatingIcon = styled(Box)(() => ({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(120, 60, 200, 0.15)',
  border: '2px solid rgba(150, 80, 220, 0.25)',
  borderRadius: '12px',
  color: 'rgba(180, 130, 255, 0.6)',
  pointerEvents: 'none',
  zIndex: 0,
}));

const positions = [
  { top: '3%', left: '2%', size: 54, rotate: '-14deg' },
  { top: '7%', left: '20%', size: 36, rotate: '12deg' },
  { top: '4%', right: '3%', size: 48, rotate: '8deg' },
  { top: '16%', right: '16%', size: 30, rotate: '-6deg' },
  { top: '20%', left: '5%', size: 40, rotate: '16deg' },
  { top: '33%', left: '1%', size: 32, rotate: '-10deg' },
  { top: '40%', right: '2%', size: 46, rotate: '20deg' },
  { top: '48%', left: '9%', size: 28, rotate: '5deg' },
  { top: '52%', right: '10%', size: 34, rotate: '-18deg' },
  { bottom: '36%', left: '3%', size: 38, rotate: '11deg' },
  { bottom: '28%', right: '4%', size: 42, rotate: '-8deg' },
  { bottom: '20%', left: '13%', size: 26, rotate: '14deg' },
  { bottom: '16%', right: '18%', size: 32, rotate: '-12deg' },
  { bottom: '7%', left: '4%', size: 50, rotate: '7deg' },
  { bottom: '5%', right: '2%', size: 36, rotate: '-16deg' },
  { top: '28%', right: '26%', size: 24, rotate: '9deg' },
  { top: '62%', left: '3%', size: 30, rotate: '-4deg' },
  { top: '10%', left: '40%', size: 22, rotate: '18deg' },
];

// Each screen has its own unique icon set — no icon type shared across pages
const screenIconSets = {
  home: [
    CasinoIcon, RocketLaunchIcon, GroupsIcon, CelebrationIcon,
    StarIcon, FavoriteIcon, NightlifeIcon, LocalBarIcon,
    SportsBarIcon, CakeIcon, MusicNoteIcon, TheaterComedyIcon,
  ],
  createRoom: [
    SettingsIcon, TuneIcon, BuildIcon, DashboardIcon,
    AddCircleIcon, MeetingRoomIcon, PasswordIcon, KeyIcon,
    EngineeringIcon, AdminPanelSettingsIcon, DoorFrontIcon, VpnKeyIcon,
  ],
  lobby: [
    PeopleIcon, PersonIcon, ShareIcon, LinkIcon,
    ContentCopyIcon, HourglassEmptyIcon, WifiIcon, HubIcon,
    SyncIcon, CampaignIcon, ForumIcon, PersonPinIcon,
  ],
  joinRoom: [
    PeopleIcon, PersonIcon, ShareIcon, LinkIcon,
    ContentCopyIcon, HourglassEmptyIcon, WifiIcon, HubIcon,
    SyncIcon, CampaignIcon, ForumIcon, PersonPinIcon,
  ],
  finalLeaderboard: [
    EmojiEventsIcon, MilitaryTechIcon, LeaderboardIcon, WorkspacePremiumIcon,
    CelebrationIcon, StarIcon, FavoriteIcon, NightlifeIcon,
    SportsBarIcon, CakeIcon, MusicNoteIcon, TheaterComedyIcon,
  ],
  gameplay: [
    EditIcon, CreateIcon, HowToVoteIcon, EmojiEventsIcon,
    PsychologyIcon, BallotIcon, LeaderboardIcon, QuizIcon,
    ForumIcon, PeopleIcon, PersonPinIcon, LightbulbIcon,
  ],
  howToPlay: [
    HelpIcon, MenuBookIcon, SchoolIcon, TipsAndUpdatesIcon,
    InfoIcon, PlayCircleIcon, ListAltIcon, SupportIcon,
    QuestionAnswerIcon, AssignmentIcon, ImportContactsIcon, LiveHelpIcon,
  ],
};

export default function FloatingBackgroundIcons({ screen = 'home' }) {
  const icons = screenIconSets[screen] || screenIconSets.home;

  return (
    <>
      {positions.map((pos, i) => {
        const Icon = icons[i % icons.length];
        if (!Icon) return null;

        return (
          <FloatingIcon
            key={`${screen}-${i}`}
            sx={{
              top: pos.top,
              left: pos.left,
              right: pos.right,
              bottom: pos.bottom,
              width: pos.size,
              height: pos.size,
              transform: `rotate(${pos.rotate})`,
              opacity: 0.38 + (i % 3) * 0.04,
            }}
          >
            <Icon sx={{ fontSize: pos.size * 0.5 }} />
          </FloatingIcon>
        );
      })}
    </>
  );
}
