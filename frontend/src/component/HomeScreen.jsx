import React, { useState } from 'react';
import {
  Button,
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Menu,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Language as LanguageIcon,
  Person as PersonIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  Casino as CasinoIcon,
  RocketLaunch as RocketLaunchIcon,
  PlayArrow as PlayArrowIcon,
  Brush as BrushIcon,
  Visibility as VisibilityIcon,
  Groups as GroupsIcon,
  MilitaryTech as MilitaryTechIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import { useGameSettings } from '../context/GameSettingsContext';
import { LANGUAGES } from '../utils/i18n';

const StyledButton = styled(Button)(() => ({
  borderRadius: '50px',
  padding: '14px 20px',
  fontWeight: 900,
  fontSize: '15px',
  letterSpacing: '3px',
  textTransform: 'uppercase',
  fontFamily: "'Arial Black', 'Impact', sans-serif",
  width: '100%',
  maxWidth: '400px',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': { transform: 'scale(1.02)' },
  '@media (min-width: 768px)': {
    width: 'auto',
    minWidth: '300px',
    flex: '0 0 auto',
  },
}));

export default function HomeScreen({ onCreateRoom, onJoinRoom, onHowToPlay }) {
  const { settings, update, t, languageLabel } = useGameSettings();
  const [langAnchor, setLangAnchor] = useState(null);

  const aboutItems = [
    { icon: <BrushIcon sx={{ fontSize: '16px', color: '#ce93d8' }} />, text: t('about1') },
    { icon: <VisibilityIcon sx={{ fontSize: '16px', color: '#81d4fa' }} />, text: t('about2') },
    { icon: <GroupsIcon sx={{ fontSize: '16px', color: '#a5d6a7' }} />, text: t('about3') },
    { icon: <TuneIcon sx={{ fontSize: '16px', color: '#ffcc80' }} />, text: t('about4') },
    { icon: <MilitaryTechIcon sx={{ fontSize: '16px', color: '#ffab91' }} />, text: t('about5') },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        paddingTop: { xs: '64px', md: '20px' },
        position: 'relative',
        overflow: { xs: 'auto', md: 'hidden' },
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ position: 'absolute', top: '20px', right: '24px', display: 'flex', gap: '12px', zIndex: 10 }}>
        <Button
          variant="outlined"
          onClick={(e) => setLangAnchor(e.currentTarget)}
          sx={{
            borderColor: 'rgba(255,255,255,0.15)',
            color: '#fff',
            borderRadius: '20px',
            padding: '6px 16px',
            fontSize: '13px',
            fontWeight: 500,
            gap: '6px',
            '&:hover': { borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)' },
          }}
        >
          <LanguageIcon sx={{ fontSize: '18px' }} /> {languageLabel}
        </Button>
        <Menu anchorEl={langAnchor} open={Boolean(langAnchor)} onClose={() => setLangAnchor(null)}>
          {LANGUAGES.map((lang) => (
            <MenuItem
              key={lang.code}
              selected={settings.language === lang.code}
              onClick={() => { update({ language: lang.code }); setLangAnchor(null); }}
            >
              {lang.flag} {lang.label}
            </MenuItem>
          ))}
        </Menu>
        <Button
          variant="outlined"
          sx={{
            borderColor: 'rgba(255,255,255,0.15)',
            color: '#fff',
            borderRadius: '20px',
            padding: '6px 16px',
            fontSize: '13px',
            fontWeight: 500,
            gap: '6px',
            '&:hover': { borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)' },
          }}
        >
          <PersonIcon sx={{ fontSize: '18px' }} /> Guest
        </Button>
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 5, py: 2 }}>
        <Grid container spacing={4} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 6, width: '100%' }}>
              <CasinoIcon sx={{ fontSize: { xs: '40px', md: '48px' }, color: '#f5c518', mb: 1 }} />
              <Box sx={{ transform: 'rotate(-2deg)', mb: -0.5 }}>
                <Typography variant="h1" sx={{
                  fontWeight: 900, lineHeight: 1, letterSpacing: '4px', textTransform: 'uppercase',
                  fontFamily: "'Arial Black', 'Impact', sans-serif", color: '#ffffff',
                  fontSize: { xs: '48px', md: '64px', lg: '96px' },
                }}>FAKE</Typography>
              </Box>
              <Box sx={{ transform: 'rotate(1.5deg)', mt: -0.5 }}>
                <Typography variant="h1" sx={{
                  fontWeight: 900, lineHeight: 1, letterSpacing: '4px', textTransform: 'uppercase',
                  fontFamily: "'Arial Black', 'Impact', sans-serif", color: '#f5c518',
                  fontSize: { xs: '48px', md: '64px', lg: '96px' },
                }}>ANSWER</Typography>
              </Box>
              <Box sx={{
                display: 'inline-block', background: 'linear-gradient(90deg, #e91e8c, #c2185b)', color: '#fff',
                fontWeight: 900, fontSize: { xs: '18px', md: '22px', lg: '40px' }, letterSpacing: '4px',
                padding: '3px 28px', borderRadius: '6px', mt: 0.5,
                fontFamily: "'Arial Black', 'Impact', sans-serif", textTransform: 'uppercase',
                transform: 'rotate(-1deg)',
              }}>PARTY</Box>
              <Typography variant="h6" sx={{
                color: '#d4c8f0', textAlign: 'center', mt: 2, mb: 3, fontWeight: 500,
                fontSize: { xs: '18px', md: '20px' },
              }}>{t('tagline')}</Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                <StyledButton variant="contained" onClick={onCreateRoom}
                  sx={{ background: 'linear-gradient(135deg, #f5c518, #f0a500)', color: '#1a0a2e', boxShadow: '0 6px 35px rgba(245,197,24,0.4)' }}
                  startIcon={<RocketLaunchIcon />}>{t('createRoom')}</StyledButton>
                <StyledButton variant="outlined" onClick={onJoinRoom}
                  sx={{ border: '2px solid rgba(255,255,255,0.2)', color: '#ffffff' }}
                  startIcon={<PlayArrowIcon />}>{t('joinRoom')}</StyledButton>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Grid container spacing={3} sx={{ justifyContent: 'center', alignItems: 'stretch' }}>
              <Grid size={{ xs: 12, md: 5.5 }} sx={{ display: 'flex' }}>
                <Paper className="home-about-card" sx={{
                  background: 'linear-gradient(160deg, rgba(156, 39, 176, 0.25), rgba(63, 81, 181, 0.15))',
                  border: '1px solid rgba(156, 39, 176, 0.3)', borderRadius: '20px', padding: '24px',
                  width: '100%', height: '100%', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <InfoIcon sx={{ fontSize: '28px', color: '#ce93d8' }} />
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>{t('aboutTitle')}</Typography>
                    <Chip label="GAME" size="small" sx={{ background: 'linear-gradient(90deg, #7b1fa2, #4a148c)', color: '#fff', fontSize: '10px', height: '20px' }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#e1bee7', mb: 2, lineHeight: 1.6 }}>{t('aboutDesc')}</Typography>
                  <Divider sx={{ borderColor: 'rgba(156, 39, 176, 0.3)', mb: 2 }} />
                  <List dense sx={{ p: 0 }}>
                    {aboutItems.map((item) => (
                      <ListItem key={item.text} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: '28px' }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={<Typography variant="body2" sx={{ color: '#e1bee7', fontSize: '14px' }}>{item.text}</Typography>} />
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ mt: 'auto', pt: 1 }}>
                    <Typography variant="caption" sx={{ color: '#ce93d8', fontStyle: 'italic', fontSize: '11px' }}>{t('aboutFooter')}</Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 5.5 }} sx={{ display: 'flex' }}>
                <Paper className="home-tutorial-card" onClick={onHowToPlay} sx={{
                  background: 'linear-gradient(160deg, rgba(255, 193, 7, 0.2), rgba(255, 152, 0, 0.1))',
                  border: '1px solid rgba(255, 193, 7, 0.3)', borderRadius: '20px', padding: '24px',
                  width: '100%', height: '100%', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column',
                  cursor: 'pointer', transition: 'all 0.3s',
                  '&:hover': { transform: 'scale(1.02)', border: '1px solid rgba(255, 193, 7, 0.5)' },
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <HelpIcon sx={{ fontSize: '28px', color: '#ffd54f' }} />
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>{t('howToPlay')}</Typography>
                    <Chip label="TUTORIAL" size="small" sx={{ background: 'linear-gradient(90deg, #f57c00, #e65100)', color: '#fff', fontSize: '10px', height: '20px' }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#ffecb3', mb: 2, lineHeight: 1.6 }}>
                    Easy to learn, fun with friends! Tap to see the full tutorial.
                  </Typography>
                  <Divider sx={{ borderColor: 'rgba(255, 193, 7, 0.3)', mb: 2 }} />
                  <List dense sx={{ p: 0 }}>
                    {['Host creates a room & shares code', 'Everyone writes a fake answer', 'Vote for the REAL answer', '+100 correct guess, +50 per fooled player'].map((text, i) => (
                      <ListItem key={text} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: '28px' }}>
                          <Box sx={{ background: '#ffd54f', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a0a2e', fontSize: '11px', fontWeight: 900 }}>{i + 1}</Box>
                        </ListItemIcon>
                        <ListItemText primary={<Typography variant="body2" sx={{ color: '#ffecb3', fontSize: '14px' }}>{text}</Typography>} />
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ mt: 'auto', pt: 1 }}>
                    <Typography variant="caption" sx={{ color: '#ffd54f', fontStyle: 'italic', fontSize: '11px' }}>
                      💡 Tip: Make your fake answers believable!
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
