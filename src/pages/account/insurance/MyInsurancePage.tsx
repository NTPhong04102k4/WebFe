import { useInsuranceHandler } from "./useInsuranceHandler";
import { PolicyTable } from "./components/PolicyTable";
import { PolicyFormPanel } from "./components/PolicyForm";
import shell from "../account-shell.module.scss";

export default function MyInsurancePage() {
  const h = useInsuranceHandler();

  return (
    <section>
      <h2 className={shell.title}>Bảo hiểm</h2>
      <p className={shell.sub}>Xem hợp đồng và mua gói mới.</p>

      <div
        className={shell.nav}
        style={{ border: "none", paddingBottom: 0, gap: "0.5rem" }}
      >
        <button
          type="button"
          className={`${shell.btn} ${shell.secondary}`}
          style={
            h.tab === "policies"
              ? { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }
              : undefined
          }
          onClick={() => h.setTab("policies")}
        >
          Hợp đồng
        </button>
        <button
          type="button"
          className={`${shell.btn} ${shell.secondary}`}
          style={
            h.tab === "new"
              ? { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }
              : undefined
          }
          onClick={() => h.setTab("new")}
        >
          Mua mới
        </button>
      </div>

      {h.tab === "policies" && (
        <>
          <h3 className={shell.title} style={{ fontSize: "1.05rem" }}>
            Hợp đồng của tôi
          </h3>
          <PolicyTable data={h.policies} loading={h.polLoading} />
        </>
      )}

      {h.tab === "new" && (
        <PolicyFormPanel
          form={h.form}
          vehicleOptions={h.vehicleOptions}
          packageOptions={h.packageOptions}
          isPending={h.isPending}
          onSubmit={h.onSubmit}
        />
      )}
    </section>
  );
}
