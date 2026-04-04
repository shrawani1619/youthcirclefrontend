import React from "react";
import { motion } from "framer-motion";
import PoseVirtualTryOn from "../../components/PoseVirtualTryOn/PoseVirtualTryOn";

const PoseVirtualTryOnPage = () => {
  return (
    <motion.main
      className="min-h-screen bg-slate-50 px-4 py-6 lg:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="w-12" />
          <h1 className="text-xl font-semibold text-slate-900">
            AI Body-Aligned Virtual Trial Room
          </h1>
          <div className="w-12" />
        </div>

        <PoseVirtualTryOn />
      </div>
    </motion.main>
  );
};

export default PoseVirtualTryOnPage;

