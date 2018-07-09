import React, { Component } from 'react';
import classnames from 'classnames';
import NotificationProps from './PropsType';
import Icon from '../Icon';
import Events from '../utils/events';

export default class Notification extends Component<NotificationProps, any> {
  static defaultProps = {
    title: '',
    message: '',
    top: 16,
    duration: 4500,
    onClick: () => {},
  };

  state = {
    visible: false,
    animationState: 'enter',
  };

  private timeout: number | undefined;
  private notification: any;

  componentDidMount () {
    Events.on(this.notification, 'transitionend', () => {
      if (this.state.animationState === 'leave') {
        this.props.willUnMount(this.notification.offsetHeight, parseInt(this.notification.style.top, 10));
      }
    });
    Events.on(this.notification, 'animationend', () => {
      if (this.state.animationState === 'leave') {
        this.props.willUnMount(this.notification.offsetHeight, parseInt(this.notification.style.top, 10));
      }
    });

    this.enter();
    this.startTimer();
  }

  componentWillUnmount () {
    if (this.state.animationState === 'leave') {
      this.stopTimer();
    }

    Events.off(this.notification, 'transitionend', () => {});
    Events.off(this.notification, 'animationend', () => {});
  }

  startTimer () {
    if (this.props.duration) {
      this.timeout = setTimeout(() => {
        this.onClose();
      }, this.props.duration);
    }
  }

  stopTimer () {
    clearInterval(this.timeout);
  }

  enter () {
    this.setState({
      animationState: 'enter',
      visible: true,
    });
  }

  leave () {
    this.notification.style.animation = 'notification-out .3s';
    this.setState({
      animationState: 'leave',
      visible: false,
    });
  }

  onClick = () => {
    if (this.props.onClick) {
      this.props.onClick();
    }
  }

  onClose = () => {
    this.stopTimer();
    this.leave();
  }

  get type () {
    switch (this.props.type) {
      case 'success':
        return 'right-round-fill';
      case 'error':
        return 'wrong-round-fill';
      case 'info':
        return 'info-round-fill';
      case 'warning':
        return 'warning-round-fill';
      default:
        return '';
    }
  }

  render () {
    return (
      <div
        ref={el => this.notification = el}
        className={classnames('ui-notification', this.props.className)}
        onClick={this.onClick}
        style={{ top: this.props.top }}
      >
        <div className={classnames('ui-notification-wrap', { 'has-icon': !!this.props.type })}>
          <div className="ui-notification-close" onClick={this.onClose}>
            <Icon type="wrong"/>
          </div>
          {this.props.type && <Icon type={this.type} className="ui-notification-icon" theme={this.props.type} />}
          <h2 className="ui-notification-title">{this.props.title}</h2>
          <div className="ui-notification-content">{this.props.message}</div>
          <div className="ui-notification-close" onClick={this.onClose} />
        </div>
      </div>
    );
  }
}
