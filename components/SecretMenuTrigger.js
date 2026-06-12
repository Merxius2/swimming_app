import { useSecretMenuTrigger } from '../hooks/useSecretMenuTrigger';

export default function SecretMenuTrigger({
  children,
  className = '',
  as: Tag = 'button',
  clicks = 3,
  ...rest
}) {
  const onSecretTap = useSecretMenuTrigger(clicks);

  return (
    <Tag
      type={Tag === 'button' ? 'button' : undefined}
      className={className}
      onClick={onSecretTap}
      {...rest}
    >
      {children}
    </Tag>
  );
}
