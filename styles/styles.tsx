import { StyleSheet } from "react-native";

const labPageStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#09111E",
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 12,
  },
  heroBanner: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A3550",
    backgroundColor: "#131F35",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  heroEyebrow: {
    color: "#FFB36E",
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: "700",
  },
  heroTitle: {
    color: "#F7FAFF",
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: "#AFBED8",
    fontSize: 13,
    lineHeight: 18,
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  statusPill: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2C3E61",
    backgroundColor: "#0D1729",
    paddingHorizontal: 8,
    paddingVertical: 7,
    gap: 2,
  },
  statusPillReady: {
    backgroundColor: "#279430",
    borderColor: "#279430",
  },
  statusLabelReady: {
    color: "#FFFFFF",
  },
  statusLabel: {
    color: "#7F95B7",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "700",
  },
  statusValue: {
    color: "#EAF1FF",
    fontSize: 12,
    fontWeight: "700",
  },
  pickerWrap: {
    borderRadius: 14,
    backgroundColor: "#101B2E",
    borderWidth: 1,
    borderColor: "#1F2E46",
    padding: 10,
  },
  panelGrid: {
    gap: 12,
  },
  panelGridWide: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
  },
  panel: {
    backgroundColor: "#101B2E",
    borderWidth: 1,
    borderColor: "#1F2E46",
    borderRadius: 16,
    padding: 14,
    minHeight: 210,
    gap: 10,
  },
  panelWide: {
    flex: 1,
  },
  panelHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  playbackCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  panelTitle: {
    color: "#F2F6FF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  metaGrid: {
    backgroundColor: "#0B1627",
    borderWidth: 1,
    borderColor: "#1D2B42",
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  metaRow: {
    color: "#D6E2F5",
    fontSize: 13,
    lineHeight: 18,
  },
  uploadZone: {
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 16,
    gap: 6,
    minHeight: 132,
  },
  uploadZoneEmpty: {
    backgroundColor: "#0B1627",
    borderColor: "#2A3A56",
  },
  uploadZoneFilled: {
    backgroundColor: "#102037",
    borderColor: "#35547A",
  },
  uploadTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  uploadSubtitle: {
    color: "#9CB0CC",
    fontSize: 12,
    textAlign: "center",
  },
  adjustSection: {
    backgroundColor: "#101B2E",
    borderWidth: 1,
    borderColor: "#1F2E46",
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  sectionTitle: {
    color: "#F2F6FF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  sliderLabel: {
    color: "#D6E2F5",
    fontSize: 13,
    marginTop: 8,
  },
  sliderValue: {
    color: "#89A3C8",
    fontSize: 12,
    marginBottom: -2,
  },
  convertedWrap: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#1F2E46",
    gap: 10,
  },
  convertedTitle: {
    color: "#F2F6FF",
    fontSize: 15,
    fontWeight: "700",
  },
  convertedActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  convertedPlayCluster: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
});
const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: "#161C2D",
    borderRadius: 10,
    display: "flex",
    height: 320,
    marginVertical: 10,
    borderWidth: 1,
    width: "35%",
    borderColor: "#252D42",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    color: "#FFFFFF",
  },
});

const inputStyles = StyleSheet.create({
  input: {
    height: 44,
    margin: 12,
    width: 220,
    borderWidth: 1,
    padding: 10,
    fontSize: 15,
  },
});
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "#161C2D",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#252D42",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
const pickerStyles = StyleSheet.create({
  picker: {
    color: "#FFFFFF",
    width: 200,
    alignContent: "center",
    justifyContent: "center",
    backgroundColor: "#0B0F1A",
    borderColor: "#279430",
    borderWidth: 1,
    borderRadius: 10,
  },
});

export { labPageStyles, cardStyles, inputStyles, modalStyles, pickerStyles };
