import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon,
  Groups as GroupsIcon,
  Timer as TimerIcon,
  EmojiEvents as EmojiEventsIcon,
  RocketLaunch as RocketLaunchIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';
import CategorySelect from './CategorySelect';

const StyledButton = styled(Button)(() => ({
  borderRadius: '50px',
  padding: '18px 20px',
  fontWeight: 900,
  fontSize: '18px',
  letterSpacing: '3px',
  textTransform: 'uppercase',
  fontFamily: "'Arial Black', 'Impact', sans-serif",
  width: '100%',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': { transform: 'scale(1.02)' },
}));

const OptionButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'active',
})(({ active }) => ({
  borderRadius: '12px',
  padding: '12px 8px',
  fontWeight: 700,
  fontSize: '16px',
  fontFamily: "'Arial Black', 'Impact', sans-serif",
  flex: 1,
  transition: 'all 0.2s',
  background: active ? 'linear-gradient(135deg, #f5c518, #f0a500)' : 'rgba(255,255,255,0.08)',
  color: active ? '#1a0a2e' : '#ffffff',
  border: active ? 'none' : '1px solid rgba(255,255,255,0.15)',
  '&:hover': {
    background: active ? 'linear-gradient(135deg, #ffd700, #f5a623)' : 'rgba(255,255,255,0.15)',
    transform: 'scale(1.02)',
  },
}));

const TimeButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'active',
})(({ active }) => ({
  borderRadius: '12px',
  padding: '12px 8px',
  fontWeight: 700,
  fontSize: '16px',
  fontFamily: "'Arial Black', 'Impact', sans-serif",
  flex: 1,
  transition: 'all 0.2s',
  background: active ? 'linear-gradient(135deg, #4fc3f7, #0288d1)' : 'rgba(255,255,255,0.08)',
  color: active ? '#0a0318' : '#ffffff',
  border: active ? 'none' : '1px solid rgba(255,255,255,0.15)',
  '&:hover': {
    background: active ? 'linear-gradient(135deg, #4fc3f7, #0288d1)' : 'rgba(255,255,255,0.15)',
    transform: 'scale(1.02)',
  },
}));

const StyledSelect = styled(Select)(() => ({
  color: '#fff',
  background: 'rgba(255,255,255,0.06)',
  borderRadius: '12px',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(245,197,24,0.5)' },
  '& .MuiSelect-icon': { color: '#fff' },
  '& .MuiInputBase-input': {
    padding: '14px 16px',
    fontFamily: "'Arial Black', 'Impact', sans-serif",
    fontSize: '16px',
  },
}));

const AVATARS = ['😀', '😎', '🤩', '🥳', '👑', '⭐', '🦊', '🐯', '🦄', '🎮'];
const MAX_PLAYER_OPTIONS = [4, 6, 8, 10, 12, 16, 20];

export default function CreateRoomScreen({ onCreate, onBack, initialProfile }) {
  const [settings, setSettings] = useState({
    rounds: 5,
    timePerRound: 45,
    maxPlayers: 10,
    categoryMode: 'mixed',
    categories: [],
  });
  const [playerName, setPlayerName] = useState(initialProfile?.name || '');
  const [avatar, setAvatar] = useState(initialProfile?.avatar || '👑');

  const canCreate = playerName.trim().length > 0;

  const renderFormFields = () => (
    <>
      <Box sx={{ flexShrink: 0 }}>
        <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, mb: 1, fontSize: { xs: '14px', sm: '16px' } }}>
          Your Name
        </Typography>
        <input
          value={playerName ?? ''}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          maxLength={20}
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.25)',
            background: 'rgba(255,255,255,0.12)',
            color: '#fff',
            fontSize: '16px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
          {AVATARS.map((a) => (
            <Box
              key={a}
              component="button"
              onClick={() => setAvatar(a)}
              sx={{
                fontSize: '24px',
                width: 40,
                height: 40,
                borderRadius: '8px',
                border: avatar === a ? '2px solid #f5c518' : '1px solid rgba(255,255,255,0.15)',
                background: avatar === a ? 'rgba(245,197,24,0.2)' : 'rgba(255,255,255,0.08)',
                cursor: 'pointer',
              }}
            >
              {a}
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <EmojiEventsIcon sx={{ fontSize: '22px', color: '#f5c518' }} />
          <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '16px' }}>
            Rounds
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {[3, 5, 7, 10].map((num) => (
            <OptionButton key={num} active={settings.rounds === num} onClick={() => setSettings({ ...settings, rounds: num })}>
              {num}
            </OptionButton>
          ))}
        </Box>
      </Box>

      <Box sx={{ flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <TimerIcon sx={{ fontSize: '22px', color: '#4fc3f7' }} />
          <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '16px' }}>
            Time per Round
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {[30, 45, 60, 90].map((time) => (
            <TimeButton key={time} active={settings.timePerRound === time} onClick={() => setSettings({ ...settings, timePerRound: time })}>
              {time}s
            </TimeButton>
          ))}
        </Box>
      </Box>

      <Box sx={{ flexShrink: 0 }}>
        <CategorySelect
          categoryMode={settings.categoryMode}
          categories={settings.categories}
          onChange={(catSettings) => setSettings({ ...settings, ...catSettings })}
        />
      </Box>
    </>
  );

  const renderMaxPlayersAndButton = () => (
    <>
      <Box sx={{ flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <GroupsIcon sx={{ fontSize: '22px', color: '#a5d6a7' }} />
          <Typography variant="subtitle1" sx={{ color: '#e0d6f5', fontWeight: 600, fontSize: '16px' }}>
            Max Players
          </Typography>
        </Box>
        <FormControl fullWidth>
          <StyledSelect
            value={settings.maxPlayers}
            onChange={(e) => setSettings({ ...settings, maxPlayers: parseInt(e.target.value, 10) })}
            IconComponent={KeyboardArrowDownIcon}
            sx={{
              background: 'rgba(255,255,255,0.12)',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.25)' },
            }}
          >
            {MAX_PLAYER_OPTIONS.map((num) => (
              <MenuItem key={num} value={num} sx={{ color: '#1a0a2e', background: '#f5f5f5' }}>{num}</MenuItem>
            ))}
          </StyledSelect>
        </FormControl>
      </Box>

      <StyledButton
        variant="contained"
        onClick={() => canCreate && onCreate(settings, playerName.trim(), avatar)}
        disabled={!canCreate}
        startIcon={<RocketLaunchIcon />}
        sx={{
          flexShrink: 0,
          mt: { xs: 0, sm: 1 },
          background: canCreate ? 'linear-gradient(135deg, #f5c518, #f0a500)' : 'rgba(255,255,255,0.1)',
          color: canCreate ? '#1a0a2e' : 'rgba(255,255,255,0.4)',
          boxShadow: canCreate ? '0 6px 35px rgba(245,197,24,0.3)' : 'none',
          '&:hover': canCreate ? {
            background: 'linear-gradient(135deg, #ffd700, #f5a623)',
            boxShadow: '0 8px 45px rgba(245,197,24,0.5)',
          } : {},
        }}
      >
        CREATE ROOM
      </StyledButton>
    </>
  );

  return (
    <Box
      sx={{
        height: '100dvh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 0, sm: 3 },
        py: { xs: 0, sm: 2 },
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 0, sm: 3 },
        }}
      >
        <Paper
          sx={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: { xs: 0, md: '32px' },
            padding: { xs: '16px', sm: '32px', md: '40px' },
            position: 'relative',
            width: '100%',
            maxWidth: '600px',
            height: { xs: '100dvh', md: 'auto' },
            maxHeight: { xs: '100dvh', md: 'calc(100dvh - 16px)' },
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            '@media (min-width: 768px) and (max-height: 820px)': {
              transform: 'scale(0.94)',
              transformOrigin: 'center center',
            },
            '@media (min-width: 768px) and (max-height: 700px)': {
              transform: 'scale(0.88)',
            },
            '@media (max-width: 767px)': {
              transform: 'none',
            },
          }}
        >
          <IconButton
            onClick={onBack}
            sx={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              color: 'rgba(255,255,255,0.5)',
              '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.08)' },
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Box sx={{ textAlign: 'center', mb: { xs: 1.5, sm: 2.5 }, mt: 1, flexShrink: 0 }}>
            <SettingsIcon sx={{ fontSize: { xs: 40, sm: 48 }, color: '#f5c518', mb: 1 }} />
            <Typography
              variant="h4"
              sx={{
                color: '#fff',
                fontWeight: 900,
                fontFamily: "'Arial Black', 'Impact', sans-serif",
                letterSpacing: '3px',
                fontSize: { xs: '26px', sm: '32px' },
              }}
            >
              CREATE ROOM
            </Typography>
          </Box>

          {/* Desktop: original single scrollable column */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flex: 1,
              minHeight: 0,
              flexDirection: 'column',
              gap: 2.5,
              overflowY: 'auto',
            }}
          >
            {renderFormFields()}
            {renderMaxPlayersAndButton()}
          </Box>

          {/* Mobile: scrollable fields + fixed bottom for Max Players & Create */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              flex: 1,
              minHeight: 0,
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                pr: 0.5,
              }}
            >
              {renderFormFields()}
            </Box>
            <Box
              sx={{
                flexShrink: 0,
                pt: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {renderMaxPlayersAndButton()}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
