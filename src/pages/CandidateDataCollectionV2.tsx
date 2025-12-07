/**
 * Flow 2 v2 - Candidate Data Collection (Single Page Form)
 * 
 * Re-exports the single-page form component.
 * Version: v2 (staging)
 */

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import F2v2_CandidateDataForm from "./flows/F2v2_CandidateDataForm";

const CandidateDataCollectionV2 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // If user is on a sub-path like /intro, redirect to main route
  useEffect(() => {
    if (location.pathname !== "/candidate-data-collection-v2" && 
        location.pathname !== "/flows/candidate-data-collection-v2") {
      navigate("/candidate-data-collection-v2", { replace: true });
    }
  }, [location.pathname, navigate]);

  return <F2v2_CandidateDataForm />;
};

export default CandidateDataCollectionV2;
