// Patch to add after existing handlers in PipelineView (after line ~520)

  const handleNewPayrollBatch = () => {
    const payrollReadyContractors = contractors.filter(c => c.status === "payroll-ready");
    
    if (payrollReadyContractors.length === 0) {
      toast.error("No payroll-ready contractors", {
        description: "Complete onboarding for contractors before creating a payroll batch.",
      });
      return;
    }

    const payees: PayrollPayee[] = payrollReadyContractors.map(c => ({
      workerId: c.id,
      name: c.name,
      countryCode: c.country === "Philippines" ? "PH" : c.country === "Norway" ? "NO" : "MX",
      currency: c.salary.includes("PHP") ? "PHP" : c.salary.includes("NOK") ? "NOK" : "MXN",
      gross: parseFloat(c.salary.replace(/[^0-9.]/g, "")),
      employerCosts: parseFloat(c.salary.replace(/[^0-9.]/g, "")) * 0.12,
      adjustments: [],
      proposedFxRate: c.salary.includes("PHP") ? 56.5 : c.salary.includes("NOK") ? 10.2 : 17.2,
      fxFee: 45,
      eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Ready",
    }));

    const period = new Date().toISOString().slice(0, 7);
    const batchId = createBatch(period, payees, "admin-001");
    
    toast.success("Payroll batch created", {
      description: `Created batch for ${payees.length} contractors. Navigating to batch...`,
    });

    setTimeout(() => {
      navigate(`/payroll/batch?id=${batchId}`);
    }, 1000);
  };

  const handleViewLastBatch = () => {
    if (batches.length === 0) {
      toast.error("No batches found", {
        description: "Create your first payroll batch to get started.",
      });
      return;
    }

    const lastBatch = batches[batches.length - 1];
    navigate(`/payroll/batch?id=${lastBatch.id}`);
  };

  const handlePreviewPayroll = (contractor: Contractor) => {
    const payee: PayrollPayee = {
      workerId: contractor.id,
      name: contractor.name,
      countryCode: contractor.country === "Philippines" ? "PH" : contractor.country === "Norway" ? "NO" : "MX",
      currency: contractor.salary.includes("PHP") ? "PHP" : contractor.salary.includes("NOK") ? "NOK" : "MXN",
      gross: parseFloat(contractor.salary.replace(/[^0-9.]/g, "")),
      employerCosts: parseFloat(c.salary.replace(/[^0-9.]/g, "")) * 0.12,
      adjustments: [],
      proposedFxRate: contractor.salary.includes("PHP") ? 56.5 : contractor.salary.includes("NOK") ? 10.2 : 17.2,
      fxFee: 45,
      eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Ready",
    };

    setSelectedPayrollPayee(payee);
    setPayrollPreviewDrawerOpen(true);
  };

// Also add at the component return ~line 700:
  const payrollReadyCount = contractors.filter(c => c.status === "payroll-ready").length;

// Add in toolbar buttons section ~line 713:
            {payrollReadyCount > 0 && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleViewLastBatch}
                  disabled={batches.length === 0}
                >
                  <History className="h-4 w-4 mr-2" />
                  View Last Batch
                </Button>
                <Button
                  size="sm"
                  onClick={handleNewPayrollBatch}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Payroll Batch
                </Button>
              </>
            )}

// Replace payroll-ready card button ~line 1122:
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => handlePreviewPayroll(contractor)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Preview Payroll
                                </Button>
                                <Button
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleNewPayrollBatch()}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Include in Batch
                                </Button>
                              </div>

// Add before closing TooltipProvider ~line 1209:
      <PayrollPreviewDrawer
        open={payrollPreviewDrawerOpen}
        onOpenChange={setPayrollPreviewDrawerOpen}
        payee={selectedPayrollPayee}
        onEdit={() => {
          setPayrollPreviewDrawerOpen(false);
          toast.info("Edit adjustments");
        }}
        onIncludeInBatch={() => {
          setPayrollPreviewDrawerOpen(false);
          handleNewPayrollBatch();
        }}
      />
