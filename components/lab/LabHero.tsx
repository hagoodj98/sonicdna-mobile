import React from "react";
import { Text, View } from "react-native";
import { labPageStyles } from "@/styles/styles";

type LabHeroProps = {
  sourceStatus: string;
  targetStatus: string;
  outputStatus: string;
};

type StatusPillProps = {
  label: string;
  status: string;
  testID: string;
};

function StatusPill({ label, status, testID }: StatusPillProps) {
  const isReady = status === "Ready";

  return (
    <View
      testID={testID}
      style={[
        labPageStyles.statusPill,
        isReady ? labPageStyles.statusPillReady : null,
      ]}
    >
      <Text
        style={[
          labPageStyles.statusLabel,
          isReady ? labPageStyles.statusLabelReady : null,
        ]}
      >
        {label}
      </Text>
      <Text style={labPageStyles.statusValue}>{status}</Text>
    </View>
  );
}

export default function LabHero({
  sourceStatus,
  targetStatus,
  outputStatus,
}: LabHeroProps) {
  return (
    <View style={labPageStyles.heroBanner}>
      <Text style={labPageStyles.heroEyebrow}>Sound DNA Lab</Text>
      <Text style={labPageStyles.heroTitle}>
        Match your target to the source profile
      </Text>
      <Text style={labPageStyles.heroSubtitle}>
        Pick a source DNA, import a target track, then tune pitch, BPM, and gain
        until it feels right.
      </Text>

      <View style={labPageStyles.statusRow}>
        <StatusPill
          label="Source"
          status={sourceStatus}
          testID="status-pill-source"
        />
        <StatusPill
          label="Target"
          status={targetStatus}
          testID="status-pill-target"
        />
        <StatusPill
          label="Output"
          status={outputStatus}
          testID="status-pill-output"
        />
      </View>
    </View>
  );
}
