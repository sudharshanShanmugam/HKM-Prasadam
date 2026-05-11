'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {
  S, SD, SP, GOLD, GOLD_PALE, CREAM, BROWN, BROWN_MID, TXT_MID, TXT_LIGHT, BORDER,
  GREEN_PALE, RED_PALE, HEADER_H,
} from './constants';
import type { View } from './constants';

interface LandingViewProps {
  onGoTo: (v: View) => void;
}

export default function LandingView({ onGoTo }: LandingViewProps) {
  return (
    <Box>
      {/* ── HERO ── */}
      <Box component="section" sx={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 30% 60%, #FFCBA8 0%, #FFD9BC 30%, #FFE8D4 60%, #FFF3EC 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pt: { xs: `${HEADER_H + 32}px`, md: `${HEADER_H + 60}px` }, pb: { xs: 7, md: 10 }, px: { xs: 2.5, md: 5 },
        position: 'relative', overflow: 'hidden',
        '&::before': {
          content: '""', position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.55) 0%, transparent 60%)',
          pointerEvents: 'none',
        },
      }}>
        <Box sx={{ maxWidth: 660, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* ISKCON Logo */}
          <Box component="img" src="/iskcon-logo.png" alt="ISKCON Thiruvanmiyur Chennai" sx={{ height: { xs: 64, md: 90 }, display: 'block', mx: 'auto', mb: { xs: 3, md: 4.5 }, objectFit: 'contain' }} />

          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: { xs: '2.6rem', md: '4rem' }, fontWeight: 700, color: BROWN, lineHeight: 1.05, mb: 1.25 }}>
            Prasadam Seva
          </Typography>
          <Typography sx={{ fontSize: { xs: '1rem', md: '1.25rem' }, fontWeight: 700, color: S, mb: 2.25, letterSpacing: '0.01em' }}>
            Serve with Devotion
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.88rem', md: '0.97rem' }, color: '#888', lineHeight: 1.75, maxWidth: 480, mx: 'auto', mb: 4.5 }}>
            Offer prasadam and receive Krishna&apos;s blessings. Every meal served is an act of love and devotion.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.75, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button onClick={() => onGoTo('register')} sx={{
              px: 4.25, py: 1.75, borderRadius: '50px', border: 'none',
              bgcolor: S, color: '#fff', fontSize: '0.95rem', fontWeight: 700,
              boxShadow: '0 6px 20px rgba(232,98,26,0.35)',
              textTransform: 'none',
              '&:hover': { bgcolor: SD, transform: 'translateY(-2px)', boxShadow: '0 10px 28px rgba(232,98,26,0.45)' },
              transition: 'all 0.2s',
            }}>
              🙏 Donate Now
            </Button>
            <Button onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })} sx={{
              px: 4.25, py: 1.75, borderRadius: '50px',
              bgcolor: '#fff', color: BROWN, fontSize: '0.95rem', fontWeight: 600,
              border: '1.5px solid rgba(0,0,0,0.1)',
              boxShadow: '0 3px 12px rgba(0,0,0,0.08)',
              textTransform: 'none',
              '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.12)', transform: 'translateY(-2px)' },
              transition: 'all 0.2s',
            }}>
              Learn More
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ── WAYS TO SERVE ── */}
      <Box component="section" sx={{ py: { xs: 8, md: 11 }, px: { xs: 2.5, md: 5 }, bgcolor: '#FDFAF4' }}>
        <Box sx={{ textAlign: 'center', mb: 6.5 }}>
          <Box component="span" sx={{ display: 'inline-block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: S, bgcolor: SP, px: 1.75, py: 0.5, borderRadius: '50px', mb: 1.75 }}>
            How to Participate
          </Box>
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: { xs: '1.9rem', md: '2.5rem' }, color: BROWN, mb: 1.25 }}>
            Ways to Serve
          </Typography>
          <Typography sx={{ fontSize: '0.92rem', color: TXT_LIGHT, lineHeight: 1.7, maxWidth: 520, mx: 'auto' }}>
            Choose how you&apos;d like to contribute towards Krishna&apos;s prasadam seva
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.75, maxWidth: 1100, mx: 'auto' }}>
          {[
            { icon: '🍛', title: 'Annadanam Seva',    desc: 'Sponsor daily prasadam for devotees and guests visiting the temple.',                              bg: SP },
            { icon: '', title: 'Festival Seva',      desc: 'Contribute towards grand festival prasadam during Janmashtami, Gaura Purnima & more.',           bg: GOLD_PALE },
            { icon: '🌿', title: 'Daily Seva',         desc: 'Support the daily operations of the temple kitchen serving hundreds every day.',                  bg: GREEN_PALE },
            { icon: '🤝', title: 'Community Feeding',  desc: 'Help us serve free meals to the underprivileged through our food distribution programs.',         bg: RED_PALE },
          ].map(c => (
            <Card key={c.title} elevation={0} sx={{
              bgcolor: '#fff', border: `1px solid ${BORDER}`, borderRadius: '18px',
              p: 0, overflow: 'hidden', transition: 'all 0.25s cubic-bezier(0.34,1.2,0.64,1)',
              boxShadow: '0 2px 12px rgba(60,20,0,0.05)',
              position: 'relative',
              '&::before': {
                content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                background: `linear-gradient(to right, ${S}, ${GOLD})`,
                transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.3s ease',
              },
              '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 16px 40px rgba(232,98,26,0.13)', borderColor: S },
              '&:hover::before': { transform: 'scaleX(1)' },
            }}>
              <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                <Box sx={{
                  width: 62, height: 62, borderRadius: '16px', bgcolor: c.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.7rem', mb: 2.5,
                  boxShadow: '0 4px 14px rgba(60,20,0,0.08)',
                }}>
                  {c.icon}
                </Box>
                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', color: BROWN, mb: 1.25 }}>
                  {c.title}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: TXT_LIGHT, lineHeight: 1.65 }}>
                  {c.desc}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* ── SEVA QUOTE ── */}
      <Box component="section" id="seva-section" sx={{
        py: { xs: 8, md: 11 }, px: { xs: 2.5, md: 5 }, textAlign: 'center', position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse at 30% 60%, #FFCBA8 0%, #FFD9BC 30%, #FFE8D4 60%, #FFF3EC 100%)',
        '&::before': {
          content: '"✦  ॐ  ✦"', position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)',
          fontSize: '0.75rem', letterSpacing: '0.3em', color: 'rgba(180,90,20,0.2)',
        },
      }}>
        <Box sx={{ maxWidth: 680, mx: 'auto', position: 'relative' }}>
          <Box component="span" sx={{ display: 'inline-block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: S, mb: 3 }}>
            Start Your Seva
          </Box>
          <Box sx={{ width: 48, height: 2, background: `linear-gradient(to right, ${S}, ${GOLD})`, borderRadius: 1, mx: 'auto', mb: 3.5 }} />
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: { xs: '1.25rem', md: '1.65rem' }, fontStyle: 'italic', color: BROWN, lineHeight: 1.65, maxWidth: 560, mx: 'auto', mb: 2 }}>
            &ldquo;If one offers Me with love and devotion a leaf, a flower, a fruit, or water, I will accept it.&rdquo;
          </Typography>
          <Typography sx={{ fontSize: '0.82rem', color: TXT_LIGHT, letterSpacing: '0.06em', mb: 4 }}>
            — Bhagavad Gita 9.26
          </Typography>
          <Button onClick={() => onGoTo('register')} sx={{
            px: 5, py: 1.75, borderRadius: '50px', border: 'none',
            bgcolor: S, color: '#fff', fontSize: '0.95rem', fontWeight: 700,
            boxShadow: '0 6px 20px rgba(232,98,26,0.3)', textTransform: 'none',
            '&:hover': { bgcolor: SD, transform: 'translateY(-2px)', boxShadow: '0 10px 28px rgba(232,98,26,0.4)' },
            transition: 'all 0.2s',
          }}>
            🙏 Book Prasadam Coupon
          </Button>
        </Box>
      </Box>

      {/* ── ABOUT ── */}
      <Box component="section" id="about-section" sx={{ py: { xs: 8, md: 11 }, px: { xs: 2.5, md: 5 }, bgcolor: CREAM }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 4.5, md: 8 }, alignItems: 'center' }}>
          <Box>
            <Box component="span" sx={{ display: 'inline-block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: S, bgcolor: SP, px: 1.75, py: 0.5, borderRadius: '50px', mb: 1.75 }}>
              About Us
            </Box>
            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: { xs: '1.9rem', md: '2.4rem' }, color: BROWN, mb: 2.25 }}>
              About HKM Chennai
            </Typography>
            <Typography sx={{ fontSize: '0.88rem', color: TXT_MID, lineHeight: 1.8, mb: 2 }}>
              Hare Krishna Movement Chennai is dedicated to propagating the teachings of Lord Sri Krishna as presented in the Bhagavad Gita and Srimad Bhagavatam.
            </Typography>
            <Typography sx={{ fontSize: '0.88rem', color: TXT_MID, lineHeight: 1.8, mb: 4 }}>
              Through our Annadanam program, we serve nutritious and delicious prasadam to devotees, visitors, and the underprivileged.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(3, 1fr)' }, gap: { xs: 1, md: 1.75 } }}>
              {[['500+', 'Meals Daily'], ['2', 'HKM Centres'], ['365', 'Days a Year']].map(([n, l]) => (
                <Box key={l} sx={{
                  textAlign: 'center', bgcolor: '#fff', border: `1px solid ${BORDER}`,
                  borderRadius: '14px', py: 2.25, px: 1.5, position: 'relative', overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(60,20,0,0.05)',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(to right, ${S}, ${GOLD})` },
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(232,98,26,0.12)' },
                }}>
                  <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: { xs: '1.6rem', md: '2.2rem' }, fontWeight: 700, color: S }}>
                    {n}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: TXT_LIGHT, mt: 0.5, fontWeight: 500 }}>
                    {l}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{
            background: `linear-gradient(135deg, ${SP} 0%, ${GOLD_PALE} 100%)`,
            border: `1.5px solid rgba(232,98,26,0.18)`,
            borderRadius: '24px', overflow: 'hidden',
            aspectRatio: '4/3',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 2, px: 4,
            boxShadow: '0 8px 32px rgba(232,98,26,0.1)',
            position: 'relative',
            '&::before': {
              content: '""', position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 70% 20%, rgba(255,255,255,0.5) 0%, transparent 60%)',
              pointerEvents: 'none',
            },
          }}>
            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', color: BROWN_MID, textAlign: 'center', lineHeight: 1.6 }}>
              Hare Krishna Hare Krishna<br />
              Krishna Krishna Hare Hare<br />
              Hare Rama Hare Rama<br />
              Rama Rama Hare Hare
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── FOOTER ── */}
      <Box component="footer" sx={{ bgcolor: BROWN, pt: 6.5, pb: 3.5, px: { xs: 2.5, md: 5 }, borderTop: `4px solid ${S}` }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr' }, gap: { xs: 4, md: 6 }, pb: 4.5, borderBottom: '1px solid rgba(255,255,255,0.08)', mb: 3 }}>
          <Box>
            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 700, color: '#fff', mb: 1 }}>
              Hare Krishna Movement Chennai
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', maxWidth: 280, mb: 2.5 }}>
              Spreading the message of Bhagavad Gita and Srimad Bhagavatam.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                [<EmailIcon sx={{ fontSize: 14 }} />, 'krishnamrita@hkmchennai.org'],
                [<PhoneIcon sx={{ fontSize: 14 }} />, '7418420108'],
                [<LocationOnIcon sx={{ fontSize: 14 }} />, 'Hare Krishna Movement Chennai'],
              ].map(([icon, text], i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.125, fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>
                  {icon}<Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>{text}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', mb: 1.75 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.125 }}>
              {[['Home', () => onGoTo('landing')], ['Donate', () => onGoTo('register')], ['Prasadam Coupons', () => onGoTo('register')]].map(([label, action]) => (
                <Button key={String(label)} onClick={action as () => void} sx={{
                  p: 0, justifyContent: 'flex-start', minWidth: 0,
                  fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)',
                  textTransform: 'none', textAlign: 'left',
                  '&:hover': { color: '#F0C842', bgcolor: 'transparent' },
                }}>
                  {String(label)}
                </Button>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', mb: 1.75 }}>
              Our Centres
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.125, mb: 3 }}>
              {['HKM Thiruvanmiyur', 'HKM NLBR'].map(c => (
                <Typography key={c} sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>{c}</Typography>
              ))}
            </Box>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', mb: 1.75 }}>
              Admin
            </Typography>
            <Button onClick={() => window.location.href = '/admin'} sx={{
              p: 0, justifyContent: 'flex-start', minWidth: 0,
              fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)',
              textTransform: 'none',
              '&:hover': { color: '#F0C842', bgcolor: 'transparent' },
            }}>
              🔐 Admin Panel
            </Button>
          </Box>
        </Box>

        <Box sx={{ maxWidth: 1100, mx: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
            © 2026 Hare Krishna Movement Chennai. All rights reserved.
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
            Hare Krishna
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
