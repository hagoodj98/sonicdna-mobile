import React from "react";
import { Modal, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { modalStyles } from "@/styles/styles";
type ModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const ModalCustom = ({ visible, onClose, children }: ModalProps) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <Modal
          animationType="slide"
          transparent={true}
          visible={visible}
          onRequestClose={onClose}
        >
          <View style={modalStyles.centeredView}>
            <View style={modalStyles.modalView}>{children}</View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ModalCustom;
