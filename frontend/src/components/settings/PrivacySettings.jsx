import {
  Download,
  LockKeyhole,
  LogOut,
  Trash2,
} from "lucide-react";

const PrivacySettings = () => {
  return (
    <section className="settings-section">
      <div className="settings-section__header">
        <span>
          <LockKeyhole size={20} />
        </span>

        <div>
          <h2>
            Privacy & Security
          </h2>

          <p>
            Manage account security,
            research data and active
            sessions.
          </p>
        </div>
      </div>

      <div className="settings-action-list">
        <div>
          <div>
            <strong>
              Change Password
            </strong>

            <p>
              Update your account
              password.
            </p>
          </div>

          <button type="button">
            Change Password
          </button>
        </div>

        <div>
          <div>
            <strong>
              Export Research Data
            </strong>

            <p>
              Download a copy of your
              Researcify research data.
            </p>
          </div>

          <button type="button">
            <Download size={15} />
            Export
          </button>
        </div>

        <div>
          <div>
            <strong>
              Sign Out Other Sessions
            </strong>

            <p>
              Sign out Researcify on
              your other devices.
            </p>
          </div>

          <button type="button">
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>

      <div className="settings-danger-zone">
        <div>
          <strong>
            Delete Account
          </strong>

          <p>
            Permanently remove your
            account and research
            workspace.
          </p>
        </div>

        <button type="button">
          <Trash2 size={15} />
          Delete Account
        </button>
      </div>
    </section>
  );
};

export default PrivacySettings;