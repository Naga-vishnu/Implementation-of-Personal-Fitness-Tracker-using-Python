from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import matplotlib.pyplot as plt
import io, base64
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'  # Ensure this is set to a secure secret key

login_manager = LoginManager(app)
login_manager.login_view = 'login'

users = {}
workouts = []

class User(UserMixin):
    def __init__(self, id, email, password):
        self.id = id
        self.username = email  # Treat email as username
        self.password = password

@login_manager.user_loader
def load_user(user_id):
    return users.get(int(user_id))

@app.route('/')
@login_required
def index():
    user_workouts = [w for w in workouts if w['user_id'] == current_user.id]
    return render_template('index.html', workouts=user_workouts)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        if any(user.username == email for user in users.values()):  # Check email instead of username
            flash('Email already taken. Choose another.', 'danger')
            return redirect(url_for('register'))
        password = request.form['password']
        user_id = len(users) + 1
        users[user_id] = User(user_id, email, password)  # Store email
        flash('Account created successfully! Please log in.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')  # Updated to match the form field
        password = request.form.get('password')
        
        # Find the user by email instead of username
        user = next((u for u in users.values() if u.username == email and u.password == password), None)
        
        if user:
            login_user(user)
            return redirect(url_for('index'))
        flash('Invalid email or password.', 'danger')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out successfully.', 'success')
    return redirect(url_for('login'))

@app.route('/add', methods=['GET', 'POST'])
@login_required
def add_workout():
    if request.method == 'POST':
        workout = {
            'user_id': current_user.id,
            'date': datetime.strptime(request.form['date'], '%Y-%m-%d').date(),
            'exercise': request.form['exercise'],
            'duration': int(request.form['duration']),
            'calories_burned': int(request.form['calories'])
        }
        workouts.append(workout)
        return redirect(url_for('index'))
    return render_template('add.html')

@app.route('/edit/<int:index>', methods=['GET', 'POST'])
@login_required
def edit_workout(index):
    if 0 <= index < len(workouts) and workouts[index]['user_id'] == current_user.id:
        if request.method == 'POST':
            workouts[index]['date'] = datetime.strptime(request.form['date'], '%Y-%m-%d').date()
            workouts[index]['exercise'] = request.form['exercise']
            workouts[index]['duration'] = int(request.form['duration'])
            workouts[index]['calories_burned'] = int(request.form['calories'])
            flash('Workout updated successfully!', 'success')
            return redirect(url_for('index'))
        return render_template('edit.html', workout=workouts[index], index=index)
    flash('Workout not found or unauthorized!', 'danger')
    return redirect(url_for('index'))

@app.route('/delete/<int:index>')
@login_required
def delete_workout(index):
    if 0 <= index < len(workouts) and workouts[index]['user_id'] == current_user.id:
        workouts.pop(index)
    return redirect(url_for('index'))

@app.route('/chart')
@login_required
def chart():
    user_workouts = [w for w in workouts if w['user_id'] == current_user.id]
    if not user_workouts:
        flash('No workout data available to generate a chart.', 'warning')
        return redirect(url_for('index'))
    dates = [w['date'].strftime('%Y-%m-%d') for w in user_workouts]
    calories = [w['calories_burned'] for w in user_workouts]
    plt.figure(figsize=(8, 4))
    plt.plot(dates, calories, marker='o', linestyle='-', color='b')
    plt.xlabel('Date')
    plt.ylabel('Calories Burned')
    plt.title('Workout Trends')
    plt.xticks(rotation=45)
    plt.tight_layout()
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    encoded_img = base64.b64encode(img.getvalue()).decode('utf-8')
    return render_template('chart.html', chart_image=encoded_img)

@app.route('/bmi', methods=['GET', 'POST'])
@login_required
def bmi():
    bmi_value = None
    category = None
    if request.method == 'POST':
        weight = float(request.form['weight'])
        height = float(request.form['height']) / 100  # Convert cm to meters
        bmi_value = round(weight / (height ** 2), 2)
        if bmi_value < 18.5:
            category = 'Underweight'
        elif 18.5 <= bmi_value < 24.9:
            category = 'Normal weight'
        elif 25 <= bmi_value < 29.9:
            category = 'Overweight'
        else:
            category = 'Obese'
    return render_template('bmi.html', bmi=bmi_value, category=category)

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

if __name__ == '__main__':
    app.run(debug=True)
