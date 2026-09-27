import {
  Camera,
  Mail,
  Save,
  UserRound,
} from "lucide-react";

import {
  useState,
} from "react";

const ProfileSettings = () => {
  const [profile, setProfile] =
    useState({
      name: "Aanya Rao",
      email:
        "aanya.rao@university.edu",
      institution:
        "University Research Lab",
      role: "Researcher",
      bio:
        "Researching artificial intelligence, education and human-centered AI.",
    });

  const update = (
    field,
    value
  ) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <section className="settings-section">
      <div className="settings-section__header">
        <span>
          <UserRound size={20} />
        </span>

        <div>
          <h2>Profile</h2>
          <p>
            Manage your researcher
            identity and account
            information.
          </p>
        </div>
      </div>

      <div className="settings-profile">
        <div className="settings-avatar">
          <span>AR</span>

          <button type="button">
            <Camera size={14} />
          </button>
        </div>

        <div>
          <strong>
            Profile picture
          </strong>

          <p>
            JPG or PNG. Maximum 5 MB.
          </p>
        </div>
      </div>

      <div className="settings-form-grid">
        <label>
          <span>Full Name</span>

          <input
            value={profile.name}
            onChange={(event) =>
              update(
                "name",
                event.target.value
              )
            }
          />
        </label>

        <label>
          <span>Email Address</span>

          <div className="settings-input-icon">
            <Mail size={16} />

            <input
              type="email"
              value={profile.email}
              onChange={(event) =>
                update(
                  "email",
                  event.target.value
                )
              }
            />
          </div>
        </label>

        <label>
          <span>Institution</span>

          <input
            value={
              profile.institution
            }
            onChange={(event) =>
              update(
                "institution",
                event.target.value
              )
            }
          />
        </label>

        <label>
          <span>Research Role</span>

          <select
            value={profile.role}
            onChange={(event) =>
              update(
                "role",
                event.target.value
              )
            }
          >
            <option>
              Researcher
            </option>
            <option>Student</option>
            <option>
              Academic
            </option>
            <option>
              Independent Researcher
            </option>
          </select>
        </label>

        <label className="settings-field-full">
          <span>Research Bio</span>

          <textarea
            rows="4"
            value={profile.bio}
            onChange={(event) =>
              update(
                "bio",
                event.target.value
              )
            }
          />
        </label>
      </div>

      <div className="settings-save-row">
        <button type="button">
          <Save size={16} />
          Save Changes
        </button>
      </div>
    </section>
  );
};

export default ProfileSettings;