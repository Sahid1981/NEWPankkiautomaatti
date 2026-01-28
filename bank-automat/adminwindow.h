#ifndef ADMINWINDOW_H
#define ADMINWINDOW_H

#include <QWidget>

namespace Ui {
class adminwindow;
}

class adminwindow : public QWidget
{
    Q_OBJECT

public:
    explicit adminwindow(QString user, QWidget *parent = nullptr);
    ~adminwindow();

private:
    Ui::adminwindow *ui;
    QString user;

protected:
    void paintEvent(QPaintEvent *event) override;
};

#endif // ADMINWINDOW_H
