/**
 * Flow 2 — Candidate Data Collection v2 (Staging)
 * 
 * ISOLATED DUPLICATE of Flow 2 — Candidate Data Collection v1
 * Created: 2025-12-07
 * 
 * This file redirects to the multi-step flow intro.
 * v1 remains completely unchanged and locked.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CandidateDataCollectionV2: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the multi-step flow intro
    navigate("/candidate-data-collection-v2/intro", { replace: true });
  }, [navigate]);

  return null;
};

export default CandidateDataCollectionV2;
