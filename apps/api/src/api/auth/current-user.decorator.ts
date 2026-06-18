import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { CurrentUser } from 'core/auth/current-user.types';

type RequestWithUser = {
  currentUser?: CurrentUser;
};

export const CurrentUserParam = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentUser => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (!request.currentUser) {
      throw new Error('Current user is not available');
    }

    return request.currentUser;
  },
);
