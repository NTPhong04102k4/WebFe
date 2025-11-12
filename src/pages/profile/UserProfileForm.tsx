import React, { useMemo, useState, useEffect, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import styled from "styled-components";
import { useAuth } from "src/shared/hooks/auth/index.ts";
import { FaCamera } from "react-icons/fa";
import {
  profileSchema,
  ProfileFormValues,
} from "src/shared/validation/profileSchema";

const Container = styled.div`
  min-height: calc(100vh - 160px);
  background: linear-gradient(135deg, #050b2b 0%, #0a1542 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
`;

const Card = styled.div`
  width: 100%;
  max-width: 720px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 36px;
  color: #fff;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 12px;
  font-weight: 600;
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 28px;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px 24px;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FieldLabel = styled.span`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const ErrorText = styled.span`
  font-size: 13px;
  color: #ff8383;
`;

const Input = styled.input<{ $readOnly?: boolean }>`
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: ${({ $readOnly }) =>
    $readOnly ? "rgba(255, 255, 255, 0.08)" : "rgba(5, 11, 43, 0.65)"};
  color: #fff;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: rgba(82, 182, 255, 0.85);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.45);
  }
`;

const Footer = styled.div`
  grid-column: 1 / -1;
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 12px 22px;
  border-radius: 12px;
  background: #52b6ff;
  color: #050b2b;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(82, 182, 255, 0.35);
  }
`;

const AvatarPreview = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const AvatarBox = styled.div`
  position: relative;
  width: 88px;
  height: 88px;
`;

const AvatarImage = styled.img`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

const CameraButton = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const AvatarInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const AvatarLabel = styled.span`
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.6);
`;

const AvatarValue = styled.span`
  font-size: 17px;
  font-weight: 600;
`;

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
};

const buildAvatar = (fullName: string, avatar?: string | null) => {
  if (avatar && avatar.trim().length > 0) return avatar;
  const encoded = encodeURIComponent(fullName || "User");
  return `https://ui-avatars.com/api/?name=${encoded}&background=050b2b&color=fff&size=160`;
};

const UserProfileForm: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initialValues = useMemo(
    () => ({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      username: user?.username ?? "",
      identityNumber: user?.identityNumber ?? "",
      phone: user?.phone ?? "",
      dateOfBirth: formatDate(user?.dateOfBirth) ?? "",
      image: user?.image ?? "",
    }),
    [user]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: yupResolver(profileSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const watchedFirstName = watch("firstName") ?? "";
  const watchedLastName = watch("lastName") ?? "";
  const watchedImage = watch("image");

  const fullName = useMemo(() => {
    const trimmedFirst = watchedFirstName.trim();
    const trimmedLast = watchedLastName.trim();
    if (!trimmedFirst && !trimmedLast) return user?.fullName ?? "";
    return `${trimmedFirst}${
      trimmedFirst && trimmedLast ? " " : ""
    }${trimmedLast}`;
  }, [watchedFirstName, watchedLastName, user?.fullName]);

  const [hasImageError, setHasImageError] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(() =>
    buildAvatar(
      fullName,
      typeof watchedImage === "string" ? watchedImage : user?.image
    )
  );

  useEffect(() => {
    if (hasImageError) {
      setPreviewUrl(buildAvatar(fullName, user?.image));
    }
  }, [hasImageError, fullName, user?.image]);

  useEffect(() => {
    setHasImageError(false);
    if (!watchedImage) {
      setPreviewUrl(buildAvatar(fullName, user?.image));
      return;
    }
    if (typeof watchedImage === "string") {
      setPreviewUrl(watchedImage || buildAvatar(fullName, user?.image));
      return;
    }
    const file = watchedImage as File;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [watchedImage, fullName, user?.image]);

  const email = user?.email ?? "";

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setHasImageError(false);
    setValue("image", file, { shouldValidate: true, shouldTouch: true });
    event.target.value = "";
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = (values) => {
    const ok = window.confirm("Xác nhận lưu thay đổi hồ sơ?");
    if (!ok) {
      reset(initialValues);
      setHasImageError(false);
      return;
    }
    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      username: values.username.trim(),
      fullName: fullName.trim(),
      identityNumber: values.identityNumber.trim(),
      phone: values.phone.trim(),
      dateOfBirth: values.dateOfBirth,
      image:
        values.image instanceof File
          ? values.image
          : values.image || previewUrl,
      email,
    };
    console.log("payload", payload);
  };

  return (
    <Container>
      <Card>
        <Title>Personal Information</Title>
        <Subtitle>Update your details and profile image.</Subtitle>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Field>
            <FieldLabel>First Name</FieldLabel>
            <Input
              {...register("firstName")}
              placeholder="Enter first name"
              aria-invalid={!!errors.firstName}
            />
            {errors.firstName && (
              <ErrorText>{errors.firstName.message}</ErrorText>
            )}
          </Field>

          <Field>
            <FieldLabel>Last Name</FieldLabel>
            <Input
              {...register("lastName")}
              placeholder="Enter last name"
              aria-invalid={!!errors.lastName}
            />
            {errors.lastName && (
              <ErrorText>{errors.lastName.message}</ErrorText>
            )}
          </Field>

          <Field>
            <FieldLabel>Username</FieldLabel>
            <Input
              {...register("username")}
              placeholder="Enter username"
              aria-invalid={!!errors.username}
            />
            {errors.username && (
              <ErrorText>{errors.username.message}</ErrorText>
            )}
          </Field>

          <Field>
            <FieldLabel>Full Name</FieldLabel>
            <Input value={fullName} readOnly $readOnly />
          </Field>

          <Field>
            <FieldLabel>Identity Number</FieldLabel>
            <Input
              inputMode="numeric"
              {...register("identityNumber")}
              placeholder="Enter identity number"
              aria-invalid={!!errors.identityNumber}
            />
            {errors.identityNumber && (
              <ErrorText>{errors.identityNumber.message}</ErrorText>
            )}
          </Field>

          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input value={email} readOnly $readOnly />
          </Field>

          <Field>
            <FieldLabel>Phone</FieldLabel>
            <Input
              inputMode="tel"
              {...register("phone")}
              placeholder="Enter phone number"
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <ErrorText>{errors.phone.message}</ErrorText>}
          </Field>

          <Field>
            <FieldLabel>Date of Birth</FieldLabel>
            <Input
              type="date"
              {...register("dateOfBirth")}
              aria-invalid={!!errors.dateOfBirth}
            />
            {errors.dateOfBirth && (
              <ErrorText>{errors.dateOfBirth.message}</ErrorText>
            )}
          </Field>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <AvatarPreview>
            <AvatarBox>
              <AvatarImage
                src={previewUrl}
                alt={fullName || "Profile Avatar"}
                onError={() => {
                  setHasImageError(true);
                  setValue("image", null, {
                    shouldValidate: true,
                    shouldTouch: true,
                  });
                }}
              />
              <CameraButton
                type="button"
                onClick={handlePickImage}
                aria-label="Change avatar"
              >
                <FaCamera size={24} color="#fff" />
              </CameraButton>
            </AvatarBox>
            <AvatarInfo>
              <AvatarLabel>Profile Preview</AvatarLabel>
              <AvatarValue>{fullName || "Unnamed User"}</AvatarValue>
              <span>{email}</span>
            </AvatarInfo>
          </AvatarPreview>

          <Footer>
            <Button type="submit">Save Changes</Button>
          </Footer>
        </Form>
      </Card>
    </Container>
  );
};

export default UserProfileForm;
