import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import { tags } from '../utils/constants';
import styles from '../AddGpt.styles';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

export const TagSelector = ({ selectedTags, onTagPress, darkModeEnabled, tagContainerStyle }) => (
  <Animated.View style={[
    styles.tagsContainerWrapper,
    tagContainerStyle
  ]}>
    <Text style={[
      styles.sectionTitle,
      darkModeEnabled && styles.textDark,
      isSmallDevice && styles.sectionTitleSmall
    ]}>
      Select Tags
    </Text>
    <View style={styles.tagsContainer}>
      {tags.map((tag) => {
        const selected = selectedTags.includes(tag.label);
        return (
          <TouchableOpacity
            key={tag.label}
            style={[
              styles.tag,
              isSmallDevice && styles.tagSmall,
              darkModeEnabled && styles.tagDark,
              selected && styles.tagSelected
            ]}
            onPress={() => onTagPress(tag)}
            activeOpacity={0.7}
          >
            <FontAwesome5
              name={tag.icon}
              size={isSmallDevice ? 12 : 14}
              color={selected ? '#fff' : (darkModeEnabled ? '#fff' : '#7209b7')}
              style={styles.tagIcon}
            />
            <Text
              style={[
                styles.tagText,
                isSmallDevice && styles.tagTextSmall,
                darkModeEnabled && styles.tagTextDark,
                selected && styles.tagTextSelected
              ]}
            >
              {tag.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </Animated.View>
);