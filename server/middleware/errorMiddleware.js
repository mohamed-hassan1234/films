const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, _req, res, _next) => {
  const isUploadSizeError = err.name === "MulterError" && err.code === "LIMIT_FILE_SIZE";
  const isBodySizeError = err.type === "entity.too.large" || err.status === 413;
  const isUploadError = err.name === "MulterError";
  const isValidationError = err.name === "ValidationError";
  const isCastError = err.name === "CastError";
  const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 5120);
  const status =
    err.statusCode ||
    (isUploadSizeError || isBodySizeError ? 413 : undefined) ||
    (isUploadError || isValidationError || isCastError ? 400 : undefined) ||
    (res.statusCode === 200 ? 500 : res.statusCode);
  const message = isUploadSizeError
    ? `The uploaded movie file is too large. The current limit is ${maxUploadMb} MB.`
    : isBodySizeError
      ? "The request is too large for the server. If this happens only after deployment, increase your reverse proxy/client body size limit."
    : err.message || "Server error";

  res.status(status).json({
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};

module.exports = { notFound, errorHandler };
