import React from "react";
import "./App.css";
import {
  Box,
  Button,
  Card,
  CardHeader,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

// ---- Config ----
const CATEGORIES = [
  { key: "food", label: "Food", color: "red" },
  { key: "transport", label: "Transport", color: "darkblue" },
  { key: "entertainment", label: "Entertainment", color: "purple" },
  { key: "travel", label: "Travel", color: "green" },
  { key: "other", label: "Other", color: "black" },
];

export default function App() {
  // ---- Form state ----
  const [expenseType, setExpenseType] = React.useState("");
  const [expenseName, setExpenseName] = React.useState("");
  const [amount, setAmount] = React.useState("");

  // ---- Data state ----
  const [expenses, setExpenses] = React.useState([]);

  // ---- Derived totals & percentages (memoized) ----
  const { totalsByType, totalAmount, percentages } = React.useMemo(() => {
    const totals = CATEGORIES.reduce((acc, c) => ({ ...acc, [c.key]: 0 }), {});
    let total = 0;

    for (const exp of expenses) {
      const val = Number(exp.amount) || 0;
      total += val;
      if (totals[exp.type] !== undefined) totals[exp.type] += val;
    }

    const pct = CATEGORIES.reduce((acc, c) => {
      const v = totals[c.key];
      acc[c.key] = total > 0 ? ((v / total) * 100).toFixed(2) : "0.00";
      return acc;
    }, {});

    return { totalsByType: totals, totalAmount: total, percentages: pct };
  }, [expenses]);

  // ---- Handlers (memoized) ----
  const handleAddExpense = React.useCallback(() => {
    const trimmedName = expenseName.trim();
    const numericAmount = Number(amount);

    if (!trimmedName) return;
    if (!expenseType) return;
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return;

    setExpenses((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        expenseName: trimmedName,
        amount: numericAmount,
        type: expenseType,
      },
    ]);

    // reset form
    setExpenseName("");
    setAmount("");
    setExpenseType("");
  }, [expenseName, amount, expenseType]);

  const handleRemove = React.useCallback((id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleClearAll = React.useCallback(() => {
    setExpenses([]);
  }, []);

  // ---- UI helpers ----
  const renderBarSegment = (key) => {
    const cat = CATEGORIES.find((c) => c.key === key);
    const width = percentages[key] + "%";
    return (
      <Box
        key={key}
        title={`${cat.label}: ${percentages[key]}%`}
        aria-label={`${cat.label} ${percentages[key]} percent`}
        sx={{
          width,
          minHeight: 40,
          bgcolor: cat.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: "0.85rem",
        }}
      >
        {Number(percentages[key]) >= 8 ? `${percentages[key]}%` : null}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Card elevation={1}>
        <CardHeader
          title="My Expense Tracker"
          subheader={totalAmount > 0 ? `Total: $${totalAmount.toFixed(2)}` : "Add your first expense"}
        />
        <Divider />
        {/* Summary bar (responsive) */}
        <Box sx={{ px: 2, py: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box
                role="img"
                aria-label="Expense distribution bar"
                sx={{
                  display: "flex",
                  width: "100%",
                  borderRadius: 1,
                  overflow: "hidden",
                  border: "1px solid #e0e0e0",
                }}
              >
                {CATEGORIES.map((c) => renderBarSegment(c.key))}
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <Typography variant="h6">Expense Summary</Typography>
                {CATEGORIES.map((c) => (
                  <Stack key={c.key} direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 20, height: 20, bgcolor: c.color, borderRadius: 0.5 }} />
                    <Typography variant="body2">
                      {c.label}: {percentages[c.key]}%
                      {totalsByType[c.key] > 0 ? ` ($${totalsByType[c.key].toFixed(2)})` : ""}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Content: form + table (responsive) */}
        <Grid container spacing={2} sx={{ px: 2, py: 2 }}>
          {/* Left: Form */}
          <Grid item xs={12} md={5} lg={4}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={2}>
                <TextField
                  label="Expense name"
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  fullWidth
                  inputProps={{ maxLength: 80 }}
                />
                <TextField
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  fullWidth
                  inputProps={{ step: "0.01", min: "0" }}
                />
                <FormControl fullWidth>
                  <InputLabel id="expense-type-label">Expense Type</InputLabel>
                  <Select
                    labelId="expense-type-label"
                    value={expenseType}
                    label="Expense Type"
                    onChange={(e) => setExpenseType(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <MenuItem key={c.key} value={c.key}>
                        {c.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    onClick={handleAddExpense}
                    disabled={!expenseName.trim() || !expenseType || !(Number(amount) > 0)}
                  >
                    Add Expense
                  </Button>
                  <Button variant="outlined" color="inherit" onClick={handleClearAll} disabled={!expenses.length}>
                    Clear All
                  </Button>
                </Stack>

                {/* Small screen legend duplication for quick glance */}
                <Box sx={{ display: { xs: "block", md: "none" } }}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Legend
                  </Typography>
                  <Grid container spacing={1}>
                    {CATEGORIES.map((c) => (
                      <Grid key={c.key} item xs={6}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 16, height: 16, bgcolor: c.color }} />
                          <Typography variant="caption">{c.label}</Typography>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* Right: Table */}
          <Grid item xs={12} md={7} lg={8}>
            <Card
              variant="outlined"
              sx={{
                p: 2,
                height: { xs: 420, md: 520, lg: 600 },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                Expenses
              </Typography>
              <TableContainer component={Paper} sx={{ flex: 1 }}>
                <Table stickyHeader size="small" aria-label="expenses table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Expense</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }} align="right">
                        Amount
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expenses.map((expense, idx) => (
                      <TableRow
                        key={expense.id}
                        sx={{
                          "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                        }}
                      >
                        <TableCell>{expense.id}</TableCell>
                        <TableCell>{expense.expenseName}</TableCell>
                        <TableCell align="right">${Number(expense.amount).toFixed(2)}</TableCell>
                        <TableCell sx={{ textTransform: "capitalize" }}>{expense.type}</TableCell>
                        <TableCell align="center">
                          <Button size="small" color="error" onClick={() => handleRemove(expense.id)}>
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!expenses.length && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No expenses yet. Add your first one!
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
}
