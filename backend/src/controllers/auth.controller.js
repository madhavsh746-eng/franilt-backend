import asyncHandler from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return res.status(201).json(new ApiResponse(201, 'User registered successfully', result));
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return res.status(200).json(new ApiResponse(200, 'Login successful', result));
});