import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Cookies() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/Animaux.png")}
        style={styles.animals}
        resizeMode="contain"
      />

      <View style={styles.card}>
        <Text style={styles.icon}>🍪</Text>

        <Text style={styles.title}>we use cookies</Text>

        <Text style={styles.text}>
          this app uses cookies to ensure you get the best experience on our app
        </Text>

        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]}>
            <Text style={styles.btnText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.btnSecondary]}>
            <Text style={styles.btnText}>Preferences</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  animals: {
    width: "90%",
    height: 150,
    marginBottom: 12,
  },
  card: {
    width: "90%",
    backgroundColor: "rgba(79,163,163,0.1)",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
  },
  icon: {
    fontSize: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#3E7A7A",
    marginBottom: 8,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    color: "#3E7A7A",
    opacity: 0.9,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  row: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    marginHorizontal: 8,
  },
  btnPrimary: {
    backgroundColor: "#4FA3A3",
  },
  btnSecondary: {
    backgroundColor: "#4FA3A3",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
