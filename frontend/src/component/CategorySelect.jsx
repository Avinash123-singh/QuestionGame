import React, { useState } from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Divider,
  Typography,
  Box,
} from '@mui/material';
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { CATEGORIES, formatCategorySelection } from '../constants/categories';

const StyledSelect = styled(Select)(() => ({
  color: '#fff',
  background: 'rgba(255,255,255,0.1)',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '100%',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.25)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(245,197,24,0.4)' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(245,197,24,0.6)' },
  '& .MuiSelect-icon': { color: '#f5c518' },
  '& .MuiInputBase-input': {
    padding: '12px 14px',
    fontFamily: "'Arial Black', 'Impact', sans-serif",
    fontSize: '15px',
  },
}));

const menuPaperSx = {
  maxHeight: 280,
  bgcolor: '#2d1b4e',
  color: '#fff',
  border: '1px solid rgba(245,197,24,0.3)',
  borderRadius: '12px',
  mt: 0.5,
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  '& .MuiMenuItem-root': {
    color: '#fff',
    fontSize: '14px',
    py: 0.75,
    '&:hover': { bgcolor: 'rgba(245,197,24,0.15)' },
    '&.Mui-selected': { bgcolor: 'rgba(245,197,24,0.25)' },
    '&.Mui-selected:hover': { bgcolor: 'rgba(245,197,24,0.3)' },
  },
  '& .MuiCheckbox-root': { color: 'rgba(255,255,255,0.5)' },
  '& .MuiCheckbox-root.Mui-checked': { color: '#f5c518' },
};

const MIXED_VALUE = '__mixed__';

export default function CategorySelect({ categoryMode, categories, onChange, compact = false }) {
  const isMixed = categoryMode === 'mixed';

  const handleMixedClick = () => {
    onChange({ categoryMode: 'mixed', categories: [] });
  };

  const handleCategoryChange = (event) => {
    const picked = typeof event.target.value === 'string'
      ? event.target.value.split(',')
      : event.target.value;

    const valid = picked.filter((id) => id !== MIXED_VALUE && id);
    if (valid.length === 0) {
      onChange({ categoryMode: 'mixed', categories: [] });
      return;
    }
    onChange({ categoryMode: 'custom', categories: valid });
  };

  return (
    <Box sx={{ width: '100%' }}>
      {!compact && (
        <Typography variant="subtitle1" sx={{ color: '#e0d6f5', fontWeight: 600, fontSize: '16px', mb: 1 }}>
          Categories
        </Typography>
      )}
      <FormControl sx={{ width: '100%' }}>
        <StyledSelect
          multiple={!isMixed}
          value={isMixed ? MIXED_VALUE : categories}
          onChange={isMixed ? undefined : handleCategoryChange}
          IconComponent={KeyboardArrowDownIcon}
          displayEmpty
          renderValue={() => formatCategorySelection(categoryMode, categories)}
          MenuProps={{ PaperProps: { sx: menuPaperSx } }}
          sx={compact ? { '& .MuiInputBase-input': { fontSize: '13px', padding: '10px 12px' } } : {}}
        >
          <MenuItem
            value={MIXED_VALUE}
            selected={isMixed}
            onClick={handleMixedClick}
          >
            <Checkbox checked={isMixed} size="small" />
            <ListItemText
              primary="🎲 Mixed Mode"
              secondary="Har round alag category"
              secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.45)', fontSize: '11px' } }}
            />
          </MenuItem>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', my: 0.5 }} />
          {CATEGORIES.map((cat) => (
            <MenuItem
              key={cat.id}
              value={cat.id}
              onClick={() => {
                if (isMixed) {
                  onChange({ categoryMode: 'custom', categories: [cat.id] });
                }
              }}
            >
              <Checkbox checked={!isMixed && categories.includes(cat.id)} size="small" />
              <ListItemText primary={`${cat.emoji} ${cat.label}`} />
            </MenuItem>
          ))}
        </StyledSelect>
      </FormControl>
      {!compact && (
        <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', mt: 0.5 }}>
          {isMixed
            ? 'Mixed = random categories each round'
            : categories.length === 1
              ? 'Sirf isi category ke questions'
              : `${categories.length} categories selected`}
        </Typography>
      )}
    </Box>
  );
}
