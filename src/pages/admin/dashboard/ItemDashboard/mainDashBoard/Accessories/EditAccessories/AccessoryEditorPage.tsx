import React, { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CreateAccessoryEditor } from "./CreateAccessoryEditor";
import { UpdateAccessoryEditor } from "./UpdateAccessoryEditor";

export default function AccessoryEditorPage() {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;
  const isEditing = !!id && id !== "new";

  const handleClose = useCallback(() => {
    navigate("/auth/login/admin/page_manage", { replace: true });
  }, [navigate]);

  const handleSaved = useCallback(() => {
    navigate("/auth/login/admin/page_manage", { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {isEditing ? (
        <UpdateAccessoryEditor
          open={true}
          accessoryId={id!}
          onClose={handleClose}
          onSaved={handleSaved}
          variant="page"
        />
      ) : (
        <CreateAccessoryEditor
          open={true}
          onClose={handleClose}
          onSaved={handleSaved}
          variant="page"
        />
      )}
    </div>
  );
}
