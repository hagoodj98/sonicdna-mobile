import React from "react";
import { render, screen } from "@testing-library/react-native";
import ListAudio from "../components/ListAudio";

jest.mock("react-native-paper", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");

  return {
    IconButton: ({ icon, onPress }: { icon: string; onPress?: () => void }) => (
      <Pressable onPress={onPress}>
        <Text>{icon}</Text>
      </Pressable>
    ),
  };
});

describe("ListAudio", () => {
  it("renders all provided audio drafts", () => {
    const drafts = [
      {
        id: "1",
        label: "kick.wav",
        localUri: "file:///kick.wav",
        timestamp: 1,
        status: "draft",
        duration: 0,
      },
      {
        id: "2",
        label: "snare.wav",
        localUri: "file:///snare.wav",
        timestamp: 2,
        status: "draft",
        duration: 0,
      },
      {
        id: "3",
        label: "hat.wav",
        localUri: "file:///hat.wav",
        timestamp: 3,
        status: "draft",
        duration: 0,
      },
    ];

    render(
      <ListAudio
        audioDrafts={drafts}
        currentSound={null}
        playAudio={jest.fn()}
        setAudioDrafts={jest.fn()}
        uploadAudio={jest.fn()}
      />,
    );

    drafts.forEach((draft) => {
      expect(screen.getByText(draft.label)).toBeTruthy();
    });
  });
});
