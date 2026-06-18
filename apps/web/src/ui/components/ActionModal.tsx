import { Modal } from '@heroui/react';
import { ReactNode } from 'react';

type ActionModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'full' | 'cover';

type ActionModalProps = {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onOpenChange: (isOpen: boolean) => void;
  footer?: ReactNode;
  size?: ActionModalSize;
};

export function ActionModal({
  isOpen,
  title,
  children,
  onOpenChange,
  footer,
  size = 'md',
}: ActionModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop variant="opaque">
        <Modal.Container placement="center" scroll="inside" size={size}>
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>
            <Modal.Body>{children}</Modal.Body>
            {footer && <Modal.Footer>{footer}</Modal.Footer>}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
