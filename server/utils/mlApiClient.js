
const axios = require("axios");
const FormData = require("form-data");
axios.defaults.maxBodyLength = Infinity;
axios.defaults.maxContentLength = Infinity;
const fs = require("fs");

const ML_SAARTHI_URL = process.env.ML_SAARTHI_URL || "http://localhost:5002";
const FAQ_ENGINE_URL = process.env.FAQ_ENGINE_URL || "http://localhost:5001";

class MLApiClient {
  // 1) Intent
  static async predictIntent(query) {
    try {
      const response = await axios.post(
        `${ML_SAARTHI_URL}/predict`,
        { query },
        { headers: { "Content-Type": "application/json" }, timeout: 10000 }
      );
      return response.data;
    } catch (error) {
      console.error("ML API - Intent Error:", error.message || error.toString());
      throw error;
    }
  }

  // 2) Enroll voice - wavFilePaths is an array of filesystem paths
  static async enrollVoice(userId, wavFilePaths) {
    try {
      const formData = new FormData();
      formData.append("user_id", userId);

      // append every sample as 'audio_sample'
      for (const p of wavFilePaths) {
        if (!fs.existsSync(p)) {
          console.warn("MLApiClient.enrollVoice - missing file:", p);
          continue;
        }
        formData.append("audio_sample", fs.createReadStream(p));
      }

      const response = await axios.post(`${ML_SAARTHI_URL}/enroll_voice`, formData, {
        headers: formData.getHeaders(),
        timeout: 60000
      });

      // Return the ML API response body so caller can inspect status/message
      return response.data;
    } catch (error) {
      // If axios error, attempt to print response body
      console.error("ML API - Enroll Error:", (error && error.message) || error.toString());
      if (error.response && error.response.data) {
        console.error("ML API - Enroll Response:", error.response.data);
      }
      throw error;
    }
  }

  // 3) Verify voice - wavFilePath is a filesystem path
  static async verifyVoice(userId, wavFilePath) {
    try {
      const formData = new FormData();
      formData.append("user_id", userId);
      if (!fs.existsSync(wavFilePath)) {
        throw new Error("verifyVoice - wav file not found: " + wavFilePath);
      }
      formData.append("audio_verification", fs.createReadStream(wavFilePath));

      const response = await axios.post(`${ML_SAARTHI_URL}/verify_voice`, formData, {
        headers: formData.getHeaders(),
        timeout: 30000
      });

      return response.data || {};
    } catch (error) {
      console.error("ML API - Verify Error:", (error && error.message) || error.toString());
      if (error.response && error.response.data) {
        console.error("ML API - Verify Response:", error.response.data);
      }
      throw error;
    }
  }

  static async askFaq(question) {
    try {
      const response = await axios.post(
        `${FAQ_ENGINE_URL}/faq-answer`,
        { question },
        { headers: { "Content-Type": "application/json" }, timeout: 15000 }
      );
      return response.data;
    } catch (error) {
      console.error("FAQ Engine Error:", error.message || error.toString());
      throw error;
    }
  }
}

module.exports = MLApiClient;
